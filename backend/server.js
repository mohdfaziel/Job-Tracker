import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import authMiddleware from './middleware/auth.js';
import verifyCors from './middleware/cors.js';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });
console.log(`Server starting in ${process.env.NODE_ENV || 'development'} mode`);

const app = express();
const httpServer = createServer(app);
// Get frontend URL from environment variables
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log(`Using frontend URL: ${frontendURL}`);

// CORS setup for Vercel deployment
const corsOptions = {
  origin: [frontendURL, 'http://localhost:3000', 'https://job-tracker-elite.vercel.app'],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    credentials: true,
    allowedHeaders: corsOptions.allowedHeaders
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000, // 60 seconds before a client is considered disconnected
  pingInterval: 25000 // Send a ping every 25 seconds
});

// Connect to MongoDB
connectDB();

// Middleware - Order matters!
// Handle OPTIONS pre-flight 
app.options('*', cors(corsOptions));

// Apply CORS for all routes
app.use(cors(corsOptions));
app.use(verifyCors); // Extra CORS handling for Vercel

// Parse JSON bodies
app.use(express.json());

// Socket.io connection handling
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        // Verify the token and extract user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        console.log(`Authenticated user connected: ${socket.userId}`);
        
        // Add socket to a room specific to this user
        socket.join(`user-${socket.userId}`);
      } catch (tokenError) {
        console.error('Token verification failed:', tokenError);
        socket.userId = null;
      }
    }
    next();
  } catch (err) {
    console.error('Socket authentication error:', err);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}, User ID: ${socket.userId || 'unauthenticated'}`);
  
  // Create a mapping between users and their active socket IDs
  // This allows us to emit to specific users across multiple devices
  if (socket.userId) {
    // Store user's socket in memory (for multi-device support)
    const userRoom = `user-${socket.userId}`;
    socket.join(userRoom);
    console.log(`User ${socket.userId} joined room ${userRoom}`);
  }
  
  // Handle ping event to keep connection alive
  socket.on('ping', () => {
    // Just respond to keep the connection alive
    if (socket.userId) {
      const userRoom = `user-${socket.userId}`;
      console.log(`Ping received from user ${socket.userId} in room ${userRoom}`);
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}, User ID: ${socket.userId || 'unauthenticated'}`);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Job Tracker API is running', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', authMiddleware, jobRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API error handling
app.use('/api', (req, res, next) => {
  // Handle direct access to API endpoints that don't exist
  res.status(404).json({ 
    success: false,
    message: `API Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack trace:', err.stack);
  
  // Set CORS headers for error responses too
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong on the server!',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// 404 handler - must be last
app.use('*', (req, res) => {
  console.log(`404 Not Found: ${req.originalUrl}`);
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/',
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/jobs (requires auth)',
    ]
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});