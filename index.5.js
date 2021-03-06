'use strict';

const express = require('express');
const graphHTTP = require('express-graphql');

const { graphql, buildSchema } = require('graphql');

const schema = buildSchema(`
type Video {
  id: ID,
  title: String,
  duration: Int,
  watched: Boolean
}

type Query {
  video: Video
}

type Schema {
  query: Query
}
`);

const videoA = {
  id: 'a',
  title: 'Create a Graphql Schema',
  duration: 120,
  watched: true
};

const videoB = {
  id: 'b',
  title: 'Ember.js CLI',
  duration: 240,
  watched: false
};

const videos = [videoA, videoB];

const resolvers = {
  video : () => ({
    id: '1',
    title: 'bar',
    duration: 180,
    watched: true
  }),
  videos: () => (videos)
};

const query = `
query myFirstQuery {
  videos {
    id
    title
    duration
    watched
  }
}
`;

// graphql(schema, query, resolvers)
//   .then((result) => console.log(result))
//   .catch((err) => console.log(err));

/**
 * express graphql
 */
const server = express();

const port = process.env.PORT || 3000;

server.use('/graphql', graphHTTP({
  schema,
  graphiql: true,
  rootValue: resolvers
}));

server.listen(port, () => console.log(`Graphql Server running on ${port}`));

