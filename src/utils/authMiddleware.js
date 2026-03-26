import { GraphQLError } from 'graphql';
import { verifyToken } from './auth.js';

/**
 * Extracts and validates the authenticated user's ID from the GraphQL context.
 * @param {{ authorization?: string }} context - The Apollo Server context containing the Authorization header.
 * @returns {number} The authenticated user's ID.
 * @throws {GraphQLError} 401 if the token is missing or invalid/expired.
 */
const getAuthenticatedUserId = (context) => {
  const token = context?.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new GraphQLError('Authentication required. Please provide a valid JWT token.', {
      extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
    });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    throw new GraphQLError('Invalid or expired token', {
      extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
    });
  }

  return decoded.userId;
};

export { getAuthenticatedUserId };
