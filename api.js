(function() {
  'use strict';

  const router = require('express').Router();
  const db = require('./db.js');

  router.get('/', function (req, res) {
    let pkg = require('./package.json');
    res.send(pkg.version);
  });

  router.get('/nodes/', (request, response) => {
    db.getNodes()
    .then((nodes) => {
      response.json(nodes);
    })
    .catch((error) => {
      response.send(error);
    });
  });

  router.get('/nodes/:id', (request, response) => {
    db.getNode(request.params.id)
    .then((document) => {
      response.json(document);
    })
    .catch((error) => {
      response.send(error);
    });
  });

  router.get('/nodes/:id/reading/last', (request, response) => {
    db.getReading(request.params.id)
    .then((document) => {
      response.json(document);
    })
    .catch((error) => {
      response.send(error);
    });
  });

  router.get('/nodes/:id/reading/:limit?', (request, response) => {
    db.getReadings(request.params.id, request.params.limit)
    .then((readings) => {
      response.json(readings);
    })
    .catch((error) => {
      response.status(500).send(error);
    });
  });

  router.put('/nodes', (request, response) => {
    db.setNode(request.body)
    .then((storedDocument) => {
      response.json(storedDocument);
    })
    .catch((error) => {
      response.send(error);
    });
  });

  router.put('/nodes/:id/reading', (request, response) => {
    db.setReading(request.params.id, request.body)
    .then(() => {
      db.logReading(request.params.id, request.body)
      .then(() => {
        response.status(200).send('');
      })
      .catch((error) => {
        response.send(error);
      });
    });
  });

  module.exports = router;
})();