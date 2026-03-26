import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Hashes a plain-text password using bcrypt.
 * @param {string} password - The plain-text password to hash.
 * @returns {Promise<string>} The bcrypt-hashed password.
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compares a plain-text password against a bcrypt hash.
 * @param {string} password - The plain-text password to verify.
 * @param {string} hashedPassword - The stored bcrypt hash to compare against.
 * @returns {Promise<boolean>} True if the password matches, false otherwise.
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generates a signed JWT for the given user ID.
 * @param {number} userId - The user's database ID to embed in the token.
 * @returns {string} A signed JWT string that expires in 7 days.
 */
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * Verifies and decodes a JWT string.
 * @param {string} token - The JWT string to verify.
 * @returns {{ userId: number } | null} The decoded payload if valid, or null if invalid/expired.
 */
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

export { hashPassword, comparePassword, generateToken, verifyToken };
