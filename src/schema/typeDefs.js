const typeDefs = `
  type Query {
    hello: String
  }

  type Mutation {
    registerUser(email: String!, password: String!, name: String): AuthPayload!
    loginUser(email: String!, password: String!): AuthPayload!
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
`;

module.exports = typeDefs;
