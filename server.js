import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';
import typeDefs from './src/schema/typeDefs.js';
import movieResolvers from './src/resolvers/movieResolvers.js';
import userResolvers from './src/resolvers/userResolvers.js';
import 'dotenv/config';

const app = express();

const resolvers = {
  Query: {
    ...movieResolvers.Query,
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
  },
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
