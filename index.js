(function() {
  'use strict';

  const express = require('express');
  const bodyParser = require('body-parser');
  const app = express();
  const api = require('./api.js');

  app.use(bodyParser.json());
  app.use(api);

  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });

  module.exports.app = app;

})();
