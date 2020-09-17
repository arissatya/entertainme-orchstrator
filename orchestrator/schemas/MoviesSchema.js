const { gql } = require('apollo-server')
const axios = require('axios')
const Redis = require("ioredis");
const redis = new Redis();
const URL = process.env.MOVIES_DB || 'http://localhost:3001/'

const typeDefs = gql`
  type movie {
    _id: ID
    title: String
    overview: String
    poster_path: String
    popularity: Float
    tags: [String]
  }

  type movieMutationResult {
    n: Int,
    nModified: Int,
    ok: Int
  }

  input movieInput {
    title: String
    overview: String
    poster_path: String
    popularity: Float
    tags: [String]
  }

  extend type Query {
    getMovies: [movie]
    getMovie (id: ID): movie
  }

  extend type Mutation {
    addMovie(newMovie: movieInput): movie
    editMovie(id: ID newMovie: movieInput): movieMutationResult
    deleteMovie(id: ID): movieMutationResult
  }
`

const resolvers = {
  Query: {
    getMovies: async () => {
      const moviesCache = await redis.get('moviesCache')
      if (moviesCache) {
        return JSON.parse(moviesCache)
      } else {
        const { data } = await axios.get(URL)
        await redis.set('moviesCache', JSON.stringify(data))
        return data
      }
    },

    getMovie: async (parent, args, context, info) => {
      const { id } = args
      const movieCache = await redis.get('spesificMovieCache')
      if (movieCache) {
        return JSON.parse(movieCache)
      } else {
        const { data } = await axios.get(URL + id)
        await redis.set('movieCache', JSON.stringify(data))
        return data
      }
    }
  },

  Mutation: {
    addMovie: async (_, args) => {
      await redis.del('moviesCache')
      const { newMovie } = args
      const { data } = await axios.post(URL, newMovie)
      return data
    },
    editMovie: async (_, args) => {
      await redis.del('moviesCache')
      const { id, newMovie } = args
      const { data } = await axios.put(URL + id, newMovie)
      return data
    },
    deleteMovie: async (_, args) => {
      await redis.del('moviesCache')
      const { id } = args
      const { data } = await axios.delete(URL + id)
      return data
    }
  }
}

module.exports = { typeDefs, resolvers };