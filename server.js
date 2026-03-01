const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const typeDefs = require('./src/schema/typeDefs');
const resolvers = require('./src/resolvers');
require('dotenv').config();

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

startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4000 },
  context: async ({ req }) => {
    return {
      authorization: req.headers.authorization || null,
    };
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
