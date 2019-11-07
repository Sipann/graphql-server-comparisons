# GraphQL Server Comparisons


## Context

The purpose of this repo is to compare different options to set a GraphQL server.

All options fetch same data from mongoDB through mongoose ORM.


---


### apolloServer branch

Server Framework: apollo-server-express

Schema definition: Schema Definition Language (SDL)

Resolvers defined separately.

---

### express-graphql-sdl branch

Server Framework: express-graphql (reference implementation of a GraphQL API server over an Express webserver)

Schema definition: Schema Definition Language (SDL).

Resolvers defined separately.

---

### express-graphql-GraphQLSchema branch

Server Framework: express-graphql (reference implementation of a GraphQL API server over an Express webserver)

Schema definition: graphql.GraphQLSchema constructor.

Resolvers: integrated to GraphQLSchema resolve() fields.


## Forwards

Work in progress...
- refactor to avoid resolvers code duplication
- set up tests
- return more useful errors to client

