# Job Tracker API

Backend API for the Job Tracker application.

## Setup

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-frontend-app.com
NODE_ENV=development
```

### Install Dependencies

```bash
npm install
```

### Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Routes

- `GET /` - API status
- `GET /api/health` - Health check
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/verify` - Verify token
- `GET /api/jobs` - Get all jobs (requires auth)
- `GET /api/jobs/stats` - Get job stats (requires auth)
- `POST /api/jobs` - Create job (requires auth)
- `GET /api/jobs/:id` - Get job by ID (requires auth)
- `PUT /api/jobs/:id` - Update job (requires auth)
- `DELETE /api/jobs/:id` - Delete job (requires auth)

## Deployment

1. Make sure all environment variables are set
2. For platform-specific deployment:
   - Heroku: The Procfile is already configured
   - Vercel/Netlify: Configure build and start commands
   - Docker: Use the Dockerfile

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time updates
- JWT Authentication
