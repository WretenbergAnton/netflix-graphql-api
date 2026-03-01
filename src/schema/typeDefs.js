const typeDefs = `
  type Query {
    hello: String
    movies(limit: Int, offset: Int): [Movie!]!
    movie(id: Int!): Movie
    searchMovies(title: String!): [Movie!]!
  }

  type Mutation {
    registerUser(email: String!, password: String!, name: String): AuthPayload!
    loginUser(email: String!, password: String!): AuthPayload!
    
    addMovie(title: String!, director: String, releaseYear: Int, genres: String, rating: Float, description: String): Movie!
    updateMovie(id: Int!, title: String, director: String, releaseYear: Int, genres: String, rating: Float, description: String): Movie
    deleteMovie(id: Int!): Boolean!
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
    director: String
    releaseYear: Int
    genres: String
    rating: Float
    description: String
    createdAt: String!
  }
`;

module.exports = typeDefs;
