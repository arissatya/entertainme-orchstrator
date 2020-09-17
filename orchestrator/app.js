const { ApolloServer, gql, makeExecutableSchema } = require('apollo-server')
const MovieSchema =  require('./schemas/MoviesSchema')
const TvSeriesSchema =  require('./schemas/TvSeriesSchema')


const typeDefs = gql`
  type Query
  type Mutation
`

const schema = makeExecutableSchema({
  typeDefs: [typeDefs, MovieSchema.typeDefs, TvSeriesSchema.typeDefs],
  resolvers: [MovieSchema.resolvers, TvSeriesSchema.resolvers]
});

const server = new ApolloServer({ schema })

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
})