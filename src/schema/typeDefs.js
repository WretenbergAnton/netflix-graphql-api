const typeDefs = `
  type Query {
    hello: String
    movies(limit: Int, offset: Int): MovieConnection!
    movie(id: Int!): Movie
    searchMovies(title: String!): [Movie!]!
    actors: [Actor!]!
    ratings(movieId: Int!): [Rating!]!
  }

  type Mutation {
    registerUser(email: String!, password: String!, name: String): AuthPayload!
    loginUser(email: String!, password: String!): AuthPayload!
    
    addMovie(title: String!, releaseYear: Int, description: String, rating: Float): Movie!
    updateMovie(id: Int!, title: String, releaseYear: Int, description: String, rating: Float): Movie
    deleteMovie(id: Int!): Boolean!
  }

  type MovieConnection {
    movies: [Movie!]!
    totalCount: Int!
    hasNextPage: Boolean!
    totalPages: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: Int!
    email: String!
    name: String
    createdAt: String!
  }

  type Movie {
    id: Int!
    title: String!
    releaseYear: Int
    description: String
    rating: Float
    popularity: Float
    voteAverage: Float
    createdAt: String!
    actors: [Actor!]!
    genres: [Genre!]!
  }

  type Actor {
    id: Int!
    name: String!
    character: String
  }

  type Genre {
    id: Int!
    name: String!
  }

  type Rating {
    id: Int!
    movieId: Int!
    score: Float!
    comment: String
    createdAt: String!
  }
`;

module.exports = typeDefs;