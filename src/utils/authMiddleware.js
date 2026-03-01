const { verifyToken } = require('./auth');

const getAuthenticatedUserId = (context) => {
  const token = context?.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Authentication required. Please provide a valid JWT token.');
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    throw new Error('Invalid or expired token');
  }

  return decoded.userId;
};

module.exports = { getAuthenticatedUserId };
