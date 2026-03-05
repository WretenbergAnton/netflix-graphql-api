const userResolvers = require('./userResolvers');
const movieResolvers = require('./movieResolvers');

const resolvers = {
  Query: {
    hello: () => 'Hello from Netflix GraphQL API!',
    ...movieResolvers.movieQueries,
  },

  Mutation: {
    ...userResolvers,
    ...movieResolvers.movieMutations,
  },
};

module.exports = resolvers;
