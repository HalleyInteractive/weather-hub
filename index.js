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
  app.use(api);

  app.listen(3000, function () {
    console.log('Weather Hub active on port 3000!');
  });

  module.exports.app = app;

})();
