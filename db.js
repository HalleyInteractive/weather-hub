(function() {
  'use strict';

  const Node = require('./database/node.js');
  const Reading = require('./database/reading.js');
  const DataStore = require('nedb');

  /**
  * Main database for all nodes.
  * @type {DataStore}
  */
  const db = new DataStore({
    filename: 'database/nodes.db',
    autoload: true,
    timestampData: true,
    inMemoryOnly: process.env.NODE_ENV === 'test'
  });

  /**
  * Stores node specific database references, these are used to log readings.
  * @type {Object}
  */
  const nodeDb = {};

  /**
  * Interval in which to clean the database.
  * @type {Number}
  */
  const DB_COMPACTION_INTERVAL = 1000 * 60 * 10;

  // Cleans up the database, removes old update lines.
  db.persistence.setAutocompactionInterval(DB_COMPACTION_INTERVAL);


  /**
  * Retrieves all stored nodes from the database.
  * @return {Promise} promise that resolves with an array of all nodes stored
  *     in the database or rejects with an error message.
  */
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


  /**
  * Retrieves a specific node from the database.
  * @param {String} nodeId ID of the node to retrieve.
  * @return {Promise} promise Resolves with the node or rejects with an error
  *     message.
  */
  let getNode = function(nodeId) {
    return new Promise((resolve, reject) => {
      db.findOne({id: nodeId}, (error, document) => {
        if(error) {
          reject(error);
        }
        resolve(document);
      });
    });
  };


  /**
  * Stores a new node in the database.
  * @param {Object} node Object containing all information for the node.
  * @return {Promise} promise Resolves with the inserted node or rejects with an
  *     error message.
  */
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


  /**
  * Retrieves the last reading of a specific node from the database.
  * @param {String} nodeId ID of the node.
  * @return {Promise} promise Resolve returns the last reading and rejects sends
  *     back an error.
  * @example Return example {temperature:23, humidity:55}
  */
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


  /**
  * Stores a reading to the database.
  * @param {String} nodeId ID of the node.
  * @param {Object} reading Object containing the reading data,
  * @param {Number} reading.temperature {}
  */
  let setReading = function(nodeId, reading = Reading) {
    return new Promise((resolve, reject) => {
      db.update({id: nodeId}, {$set: reading}, (error) => {
        if(error) {
          reject(error);
        }
        resolve();
      });
    });
  };


  /**
  * Stores a reading in the nodes own database. This database only contains
  * readings for this node.
  * @param {String} nodeId ID of the node.
  */
  let logReading = function(nodeId, reading) {
    let readingDocument = Object.assign(Reading, reading);
    return new Promise((resolve, reject) => {
      setupNodeDatabase_(nodeId);
      nodeDb[nodeId].insert(readingDocument, (error, storedDocument) => {
        if(error) {
          reject(error);
        }
        resolve(storedDocument);
      });
    });
  };


  /**
  * Retrieves n amount of readings from a specific node.
  * @param {String} nodeId ID of the node to retrieve readings from.
  * @param {Number} limit Optional parameter to define the limit of readings,
  *     defaults to 100 if no value provided.
  * @return {Promise} promise Returns an array of readings if resolves and an
  *     error if rejects.
  */
  let getReadings = function(nodeId, limit = 100) {
    return new Promise((resolve, reject) => {
      setupNodeDatabase_(nodeId);
      nodeDb[nodeId].find()
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


  /**
  * Checks if the nodes last update is within 2 times it's update frequency.
  * @param {Object} node Node object from the database.
  * @param {Number} timestamp Timestamp of the current time.
  * @return {Boolean} isOnline Returns if the node is "online".
  */
  let isOnline = function(node, timestamp) {
    return new Date(node.updatedAt).getTime() + node.frequency * 2 < timestamp;
  };


  /**
  * Creates database for provided node ID if needed.
  * @param {String} nodeId ID of the node to create a database for.
  */
  let setupNodeDatabase_ = function(nodeId) {
    if(!nodeDb.hasOwnProperty(nodeId)) {
      nodeDb[nodeId] = new DataStore({
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
