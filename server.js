const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginLandingPageProductionDefault } = require('@apollo/server/plugin/landingPage/default');
const typeDefs = require('./src/schema/typeDefs');
const movieResolvers = require('./src/resolvers/movieResolvers');
const userResolvers = require('./src/resolvers/userResolvers');
require('dotenv').config();

const app = express();

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
  plugins: [
    ApolloServerPluginLandingPageProductionDefault({ embed: true, includeCookies: true }),
  ],
  formatError: (error) => {
    console.error('GraphQL Error:', error.message);
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    };
  }
});

/**
 * Starts the Apollo/Express server.
 * Initialises Apollo Server, mounts CORS and JSON middleware, attaches the
 * GraphQL endpoint at /graphql, and begins listening on the configured PORT.
 * @returns {Promise<void>}
 */
async function startServer() {
  await server.start();

  app.use(cors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());

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