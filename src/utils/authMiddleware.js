import { verifyToken } from './auth.js';

/**
 * Extracts and validates the authenticated user's ID from the GraphQL context.
 * @param {{ authorization?: string }} context - The Apollo Server context containing the Authorization header.
 * @returns {number} The authenticated user's ID.
 * @throws {Error} If the token is missing or invalid/expired.
 */
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

export { getAuthenticatedUserId };
