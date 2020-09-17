const { gql } = require('apollo-server')
const axios = require('axios')
const Redis = require("ioredis");
const redis = new Redis();
const URL = process.env.TVS_DB || 'http://localhost:3002/'

const typeDefs = gql`
  type tvSerie {
    _id: ID
    title: String
    overview: String
    poster_path: String
    popularity: Float
    tags: [String]
  }

  type tvSerieMutationResult {
    n: Int,
    nModified: Int,
    ok: Int
  }

  input TvSerieInput {
    title: String
    overview: String
    poster_path: String
    popularity: Float
    tags: [String]
  }

  extend type Query {
    getTvSeries: [tvSerie]
    getTvSerie (id: ID): tvSerie
  }

  extend type Mutation {
    addTvSerie(newTvSerie: TvSerieInput): tvSerie
    editTvSerie(id: ID newTvSerie: TvSerieInput): tvSerieMutationResult
    deleteTvSerie(id: ID): tvSerieMutationResult
  }
`

const resolvers = {
  Query: {
    getTvSeries: async () => {
      const tvSeriesCache = await redis.get('tvSeriesCache')
      if (tvSeriesCache) {
        return JSON.parse(tvSeriesCache)
      } else {
        const { data } = await axios.get(URL)
        await redis.set('tvSeriesCache', JSON.stringify(data))
        return data
      }
    },

    getTvSerie: async (parent, args, context, info) => {
      const { id } = args
      // const spesificTvSeriesCache = await redis.get('spesificTvSeriesCache')
      // const check = await JSON.parse(spesificTvSeriesCache)
      // // if (!check) {
      //   if (check) {
      //     await redis.del('spesificTvSeriesCache')
      //     return JSON.parse(spesificTvSeriesCache)
      //   } else {
          const { data } = await axios.get(URL + id)
          await redis.set('spesificTvSeriesCache', JSON.stringify(data))
          return data
        // }
      // } else {
      //   if (check._id === id) {
      //     return JSON.parse(spesificTvSeriesCache)
      //   } else {
      //     const { data } = await axios.get(URL + id)
      //     await redis.set('spesificTvSeriesCache', JSON.stringify(data))
      //     return data
      //   }
      // }
    }
  },

  Mutation: {
    addTvSerie: async (_, args) => {
      await redis.del('tvSeriesCache')
      const { newTvSerie } = args
      const { data } = await axios.post(URL, newTvSerie)
      return data
    },
    editTvSerie: async (_, args) => {
      await redis.del('tvSeriesCache')
      const { id, newTvSerie } = args
      const { data } = await axios.put(URL + id, newTvSerie)
      return data
    },
    deleteTvSerie: async (_, args) => {
      await redis.del('tvSeriesCache')
      const { id } = args
      const { data } = await axios.delete(URL + id)
      return data
    }
  }
}

module.exports = { typeDefs, resolvers };
