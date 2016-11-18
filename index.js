(function() {
  'use strict';

  // Manually setting timezone.
  // TODO: Need a better way of doing this.
  process.env.TZ = 'Europe/London';

  const express = require('express');
  const bodyParser = require('body-parser');
  const app = express();
  const api = require('./api.js');

  app.use(bodyParser.json());
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });
  app.use(api);
  app.use(express.static(__dirname + '/static'));

  app.listen(3000, function () {
    console.log('Weather Hub active on port 3000!');
  });

  module.exports.app = app;

})();
