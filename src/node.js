'use strict';

const {
  nodeDefinitions,
  fromGlobalId,
} = require('graphql-relay');


const { getObjectById } = require('./data');

const { nodeInterface, nodeField } = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);

    // console.log(type, id);
    
    return getObjectById(type, id);
  },
  (object) => {
    const { videoType } = require('../');

    if (object.title) {
      return videoType;
    }
    
    return null;
  }
);

exports.nodeInterface = nodeInterface;
exports.nodeField = nodeField;