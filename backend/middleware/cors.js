// CORS middleware specifically for Vercel deployment
const verifyCors = (req, res, next) => {
  // Allow from any origin
  res.header('Access-Control-Allow-Origin', '*');
  
  // Allow specific headers
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
  // Allow specific methods
  res.header('Access-Control-Allow-Methods', 
    'GET, POST, PUT, DELETE, OPTIONS');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  
  next();
};

export default verifyCors;
