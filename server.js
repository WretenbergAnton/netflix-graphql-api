const express = require('express');
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

app.get('/graphql', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset=utf-8/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Apollo Sandbox</title>
        <style>
          body { margin: 0; overflow: hidden; }
          #sandbox { height: 100vh; width: 100%; }
        </style>
      </head>
      <body>
        <div id="sandbox"></div>
        <script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>
        <script>
          new window.EmbeddedSandbox({
            target: "#sandbox",
            initialState: {
              document: "{ __typename }",
              variables: {},
              headers: {},
              url: "https://netflix-graphql-api-production.up.railway.app/graphql",
            },
          });
        </script>
      </body>
    </html>
  `);
});

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GraphQL Server is running at http://0.0.0.0:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});