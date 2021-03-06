'use strict';

const express = require('express');
const graphHTTP = require('express-graphql');

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList
} = require('graphql');

const { getVideoById, getVideos, createVideo } = require('./src/data');
const {
  globalIdField,
  connectionDefinitions,
  connectionArgs,
  connectionFromPromisedArray,
} = require('graphql-relay');
const { nodeInterface, nodeField } = require('./src/node');

const videoType = new GraphQLObjectType({
  name: 'Video',
  description: 'A Video on Egghead.io',
  fields: {
    id: globalIdField(),
    title: {
      type: GraphQLString,
      description: 'The title of the video',
    },
    duration: {
      type: GraphQLInt,
      description: 'The duration of the video(in seconds)',
    },
    watched: {
      type: GraphQLBoolean,
      description: 'Whether or not the viewer has watched this video',
    },
  },
  interfaces: [nodeInterface],
});
exports.videoType = videoType;

const { connectionType: VideoConnection } = connectionDefinitions({
  nodeType: videoType,
  connectionFields: () => ({
    totalCount: {
      type: GraphQLInt,
      description: 'A count of total number of objects in this connection',
      resolve: (conn) => {
        return conn.edges.length;
      }
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  description: 'The root query type',
  fields: {
    node: nodeField,
    videos: {
      type: VideoConnection,
      args: connectionArgs,
      resolve: (_, args) => connectionFromPromisedArray(
        getVideos(),
        args
      )
    },
    video: {
      type: videoType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The id of the video'
        }
      },
      resolve: (_, args) => getVideoById(args.id)
    },
  },
});

const videoInputType = new GraphQLInputObjectType({
  name: 'VideoInputType',
  description: 'The input type of video',
  fields: {
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the video',
    },
    duration: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The duration of the video(in seconds)',
    },
    released: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether or not the video is released',
    },
  },
})

const mutationType = new GraphQLObjectType({
  name: 'MutationType',
  description: 'The root Mutation Type',
  fields: {
    createVideo: {
      type: videoType,
      args: {
        video: {
          type: new GraphQLNonNull(videoInputType),
        }
      },
      resolve: (_, args) => createVideo(args.video)
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

/**
 * express graphql
 */
const server = express();

const port = process.env.PORT || 3000;

server.use('/graphql', graphHTTP({
  schema,
  graphiql: true,
}));

server.listen(port, () => 
  console.log(`Graphql Server running on http://localhost:${port}/graphql`)
);

