(function() {
  'use strict';

  //During the test the env variable is set to test
  process.env.NODE_ENV = 'test';

  const DataStore = require('nedb');
  const db = new DataStore({
    filename: process.env.NODE_ENV === 'test' ?
    'test/testdb.db' : 'database/nodes.db',
    autoload: true,
    timestampData: true
  });

  //Require the dev-dependencies
  let chai = require('chai');
  let chaiHttp = require('chai-http');
  let server = require('./../index.js');
  let should = chai.should();

  chai.use(chaiHttp);
  //Our parent block

  describe('Nodes', () => {
    beforeEach((done) => {
      db.remove({}, { multi: true }, () => {
        done();
      });
    });

    /*
    * Test the /GET route
    */
    describe('/GET nodes', () => {
      it('it should GET all the nodes', (done) => {
        chai.request(server)
        .get('/nodes')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
      });
    });

  });

}());
