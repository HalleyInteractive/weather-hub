(function() {
  'use strict';

  const Node = require('./database/node.js');
  const Reading = require('./database/reading.js');
  const DataStore = require('nedb');
  const db = new DataStore({
    filename: 'database/nodes.db',
    autoload: true,
    timestampData: true,
    inMemoryOnly: process.env.NODE_ENV === 'test'
  });
  const node_db = {};
  const DB_COMPACTION_INTERVAL = 1000 * 60 * 10;

  db.persistence.setAutocompactionInterval(DB_COMPACTION_INTERVAL);

  let getNodes = function() {
    return new Promise((resolve, reject) => {
      db.find({ type: 'node' }, function (err, docs) {
        if(err) {
          reject(err);
        }
        resolve(docs);
      });
    });
  };

  let getNode = function(id) {
    return new Promise((resolve, reject) => {
      db.findOne({ id: id }, (error, document) => {
        if(error) {
          reject(error);
        }
        resolve(document);
      });
    });
  };

  let setNode = function(node) {
    let nodeDocument = Object.assign(Node, node);
    return new Promise((resolve, reject) => {
      db.insert(nodeDocument, (error, storedDocument) => {
        if(error) {
          reject(error);
        }
        resolve(storedDocument);
      });
    });
  };

  let getReading = function(nodeId) {
    return new Promise((resolve, reject) => {
      db.findOne({id: nodeId})
      .projection({temperature: 1, humidity: 1 })
      .exec((error, reading) => {
        if(error) {
          reject(error);
        }
        resolve(reading);
      });
    });
  };

  let setReading = function(nodeId, reading) {
    let readingDocument = Object.assign(Reading, reading);
    return new Promise((resolve, reject) => {
      db.update({id: nodeId}, {$set: readingDocument}, (error) => {
        if(error) {
          reject(error);
        }
        resolve();
      });
    });
  };

  let logReading = function(nodeId, reading) {
    let readingDocument = Object.assign(Reading, reading);
    return new Promise((resolve, reject) => {
      setupNodeDatabase_(nodeId);
      node_db[nodeId].insert(readingDocument, (error, storedDocument) => {
        if(error) {
          reject(error);
        }
        resolve(storedDocument);
      });
    });
  };

  let getReadings = function(nodeId, limit = 100) {
    return new Promise((resolve, reject) => {
      setupNodeDatabase_(nodeId);
      node_db[nodeId].find()
      .limit(limit)
      .sort({ createdAt: -1})
      .projection({temperature: 1, humidity: 1, createdAt: 1})
      .exec((error, reading) => {
        if(error) {
          reject(error);
        }
        resolve(reading);
      });
    });
  };

  let isOnline = function(timestamp) {
    // Determine if last seen was not too long ago.
    // If so, try to ping address
    return timestamp;
  };


  let setupNodeDatabase_ = function(nodeId) {
    if(!node_db.hasOwnProperty(nodeId)) {
      node_db[nodeId] = new DataStore({
        filename: `database/nodes/${nodeId}.db`,
        autoload: true,
        timestampData: true,
        inMemoryOnly: process.env.NODE_ENV === 'test'
      });
    }
  };

  module.exports.getNodes = getNodes;
  module.exports.getNode = getNode;
  module.exports.setNode = setNode;
  module.exports.getReading = getReading;
  module.exports.setReading = setReading;
  module.exports.logReading = logReading;
  module.exports.getReadings = getReadings;
  module.exports.isOnline = isOnline;

}());
