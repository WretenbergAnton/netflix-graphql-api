const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

const prisma = new PrismaClient();

const resolvers = {
  Query: {
    hello: () => 'Hello from Netflix GraphQL API!',
  },

  Mutation: {
    registerUser: async (_, { email, password, name }) => {
      // Validera input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Kontrollera om user redan existerar
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Skapa user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
        },
      });

      // Generera token
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

    loginUser: async (_, { email, password }) => {
      // Validera input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Hitta user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Jämför password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generera token
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

module.exports = resolvers;
