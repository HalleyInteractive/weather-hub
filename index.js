(function() {
  'use strict';

  const express = require('express');
  const bodyParser = require('body-parser');
  const app = express();
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

  app.use(bodyParser.json());

  app.get('/', function (req, res) {
    let pkg = require('./package.json');
    res.send(pkg.version);
  });

  app.get('/nodes/', (request, response) => {
    getNodes()
    .then((nodes) => {
      response.json(nodes);
    })
    .catch((error) => {
      response.send(error);
    });
  });

  app.get('/nodes/:id', (request, response) => {
    getNode(request.params.id)
    .then((document) => {
      response.json(document);
    })
    .catch((error) => {
      response.send(error);
    });
  });

  app.get('/nodes/:id/reading', (request, response) => {
    getReading(request.params.id)
    .then((document) => {
      response.json(document);
    })
    .catch((error) => {
      response.send(error);
    });
  });

  app.put('/nodes', (request, response) => {
    setNode(request.body)
    .then((storedDocument) => {
      response.json(storedDocument);
    })
    .catch((error) => {
      response.send(error);
    });
  });

  app.put('/nodes/:id/reading', (request, response) => {
    setReading(request.params.id, request.body)
    .then(() => {
      logReading(request.params.id, request.body)
      .then(() => {
        response.status(200).send('');
      })
      .catch((error) => {
        response.send(error);
      });
    });
  });

  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });

  let getNodes = function() {
    let promise = new Promise((resolve, reject) => {
      db.find({ type: 'node' }, function (err, docs) {
        if(err) {
          reject(err);
        }
        resolve(docs);
      });
    });
    return promise;
  };

  let getNode = function(id) {
    let promise = new Promise((resolve, reject) => {
      db.findOne({ id: id }, (error, document) => {
        if(error) {
          reject(error);
        }
        resolve(document);
      });
    });
    return promise;
  };

  let setNode = function(node) {
    let nodeDocument = Object.assign(Node, node);
    let promise = new Promise((resolve, reject) => {
      db.insert(nodeDocument, (error, storedDocument) => {
        if(error) {
          reject(error);
        }
        resolve(storedDocument);
      });
    });
    return promise;
  };

  let isOnline = function(timestamp) {
    // Determine if last seen was not too long ago.
    // If so, try to ping address
  };

  let getReading = function(nodeId) {
    let promise = new Promise((resolve, reject) => {
      db.findOne({id: nodeId})
      .projection({temperature: 1, humidity: 1 })
      .exec((error, reading) => {
        if(error) {
          reject(error);
        }
        resolve(reading);
      });
    });
    return promise;
  };

  let setReading = function(nodeId, reading) {
    let readingDocument = Object.assign(Reading, reading);
    let promise = new Promise((resolve, reject) => {
      db.update({id: nodeId}, {$set: readingDocument}, (error) => {
        if(error) {
          reject(error);
        }
        resolve();
      });
    });
    return promise;
  };

  let logReading = function(nodeId, reading) {
    let readingDocument = Object.assign(Reading, reading);
    return new Promise((resolve, reject) => {
      if(!node_db.hasOwnProperty(nodeId)) {
        node_db[nodeId] = new DataStore({
          filename: `database/nodes/${nodeId}.db`,
          autoload: true,
          timestampData: true,
          inMemoryOnly: process.env.NODE_ENV === 'test'
        });
      }
      node_db[nodeId].insert(readingDocument, (error, storedDocument) => {
        if(error) {
          reject(error);
        }
        resolve(storedDocument);
      });
    });
  };

module.exports.app = app;
}());
