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

  // ➕ LÄGG TILL CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

app.get('/graphql', (req, res) => {
  // Dynamisk endpoint baserad på request origin
  const protocol = req.secure ? 'https' : 'http';
  const host = req.get('host');
  const endpoint = `${protocol}://${host}/graphql`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            margin: 0;
            overflow: hidden;
          }
          #embedded-sandbox {
            height: 100vh;
            width: 100%;
          }
        </style>
        <title>Apollo Sandbox</title>
      </head>
      <body>
        <div id="embedded-sandbox"></div>
        <script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>
        <script>
          new window.EmbeddedSandbox({
            target: '#embedded-sandbox',
            initialState: {
              document: '{ __typename }',
              variables: {},
              headers: {},
              url: '${endpoint}',
            },
          });
        </script>
      </body>
    </html>
  `);
});

  // POST - GraphQL queries
  app.post('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      return {
        authorization: req.headers.authorization || null,
      };
    },
  }));

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GraphQL Server is running at http://0.0.0.0:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});