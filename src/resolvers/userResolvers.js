const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

const prisma = new PrismaClient();

const userResolvers = {
  Query: {},

  Mutation: {
    /**
     * Registers a new user account and returns a JWT.
     * @param {*} _ - Unused parent resolver argument.
     * @param {{ email: string, password: string, name?: string }} args - Registration credentials.
     * @returns {Promise<{ token: string, user: object }>} The JWT and newly created user.
     * @throws {Error} If email/password are missing or the email is already taken.
     */
    registerUser: async (_, { email, password, name }) => {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
        },
      });

      const token = generateToken(user.id);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt.toISOString(),
        },
      };
    },

    /**
     * Authenticates a user and returns a JWT.
     * @param {*} _ - Unused parent resolver argument.
     * @param {{ email: string, password: string }} args - Login credentials.
     * @returns {Promise<{ token: string, user: object }>} The JWT and authenticated user.
     * @throws {Error} If credentials are missing or invalid.
     */
    loginUser: async (_, { email, password }) => {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const token = generateToken(user.id);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt.toISOString(),
        },
      };
    },
  },
};

module.exports = userResolvers;