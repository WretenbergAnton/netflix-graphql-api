const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword, generateToken, verifyToken } = require('../utils/auth');

const prisma = new PrismaClient();

const getAuthenticatedUserId = (authorization) => {
  if (!authorization) {
    throw new Error('Authentication required. Please provide a valid JWT token.');
  }

  const token = authorization.replace('Bearer ', '');
  const decoded = verifyToken(token);
  
  if (!decoded) {
    throw new Error('Invalid or expired token');
  }

  return decoded.userId;
};

const resolvers = {
  Query: {
    hello: () => 'Hello from Netflix GraphQL API!',

    movies: async (_, { limit = 10, offset = 0 }) => {
      return await prisma.movie.findMany({
        take: limit,
        skip: offset,
        orderBy: { rating: 'desc' },
        include: {
          actors: true,
          genres: true,
        },
      });
    },

    movie: async (_, { id }) => {
      return await prisma.movie.findUnique({
        where: { id },
        include: {
          actors: true,
          genres: true,
        },
      });
    },

    searchMovies: async (_, { title }) => {
      return await prisma.movie.findMany({
        where: {
          title: {
            contains: title,
            mode: 'insensitive',
          },
        },
        take: 20,
        include: {
          actors: true,
          genres: true,
        },
      });
    },
  },

  Mutation: {
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

    addMovie: async (_, { title, releaseYear, description, rating }, context) => {
      const userId = getAuthenticatedUserId(context.authorization);

      if (!title) {
        throw new Error('Title is required');
      }

      const movie = await prisma.movie.create({
        data: {
          title,
          releaseYear: releaseYear || null,
          description: description || null,
          rating: rating || null,
          createdBy: userId,
        },
        include: {
          actors: true,
          genres: true,
        },
      });

      return {
        id: movie.id,
        title: movie.title,
        releaseYear: movie.releaseYear,
        description: movie.description,
        rating: movie.rating,
        actors: movie.actors,
        genres: movie.genres,
        createdAt: movie.createdAt.toISOString(),
      };
    },

    updateMovie: async (_, { id, title, releaseYear, description, rating }, context) => {
      const userId = getAuthenticatedUserId(context.authorization);

      const movie = await prisma.movie.findUnique({
        where: { id },
      });

      if (!movie) {
        throw new Error('Movie not found');
      }

      if (movie.createdBy !== userId) {
        throw new Error('You can only update your own movies');
      }

      const updatedMovie = await prisma.movie.update({
        where: { id },
        data: {
          title: title || movie.title,
          releaseYear: releaseYear || movie.releaseYear,
          description: description || movie.description,
          rating: rating || movie.rating,
        },
        include: {
          actors: true,
          genres: true,
        },
      });

      return {
        id: updatedMovie.id,
        title: updatedMovie.title,
        releaseYear: updatedMovie.releaseYear,
        description: updatedMovie.description,
        rating: updatedMovie.rating,
        actors: updatedMovie.actors,
        genres: updatedMovie.genres,
        createdAt: updatedMovie.createdAt.toISOString(),
      };
    },

    deleteMovie: async (_, { id }, context) => {
      const userId = getAuthenticatedUserId(context.authorization);

      const movie = await prisma.movie.findUnique({
        where: { id },
      });

      if (!movie) {
        throw new Error('Movie not found');
      }

      if (movie.createdBy !== userId) {
        throw new Error('You can only delete your own movies');
      }

      await prisma.movie.delete({
        where: { id },
      });

      return true;
    },
  },
};

module.exports = resolvers;
