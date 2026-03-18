const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const typeDefs = require('./src/schema/typeDefs');
const movieResolvers = require('./src/resolvers/movieResolvers');
const userResolvers = require('./src/resolvers/userResolvers');
require('dotenv').config();

const app = express();

// Kombinera resolvers
const resolvers = {
  Query: {
    ...movieResolvers.Query,
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...movieResolvers.Mutation,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (error) => {
    console.error('GraphQL Error:', error.message);
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    };
  },
});

async function startServer() {
  await server.start();

  // ➕ CORS CONFIGURATION - FÖRE APOLLO!
  app.use(cors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());

  // GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        return {
          authorization: req.headers.authorization || null,
        };
      },
    })
  );

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GraphQL Server is running at http://0.0.0.0:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});