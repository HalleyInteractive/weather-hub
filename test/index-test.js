(function() {
  'use strict';

  //During the test the env variable is set to test
  process.env.NODE_ENV = 'test';

  //Require the dev-dependencies
  let chai = require('chai');
  let chaiHttp = require('chai-http');
  let server = require('./../index.js');
  let app = server.app;
  let db = server.db;
  let expect = chai.expect;
  let nodeObject = require('../database/node.js');
  let node = {};
  let insertResult = {
    test1: null,
    test2: null
  };

  let testReading1 = {
    temperature: 30,
    humidity: 40
  };

  let testReading2 = {
    temperature: 35,
    humidity: 44
  };

  chai.use(chaiHttp);

  describe('Nodes', () => {
    before((done) => {
      node = Object.assign(
        {_id:'test', createdAt:null, updatedAt:null},
        nodeObject);
      db.remove({type:'node'}, { multi: true }, (err, removed) => {
        done();
      });
    });

    describe('/GET nodes', () => {
      it('it should GET no nodes, empty', (done) => {
        chai.request(app)
        .get('/nodes')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.equal(0);
          done();
        });
      });
    });

    describe('/PUT node id:test1', () => {
      it('it should add a node', (done) => {
        chai.request(app)
        .put('/nodes')
        .send({id:'test1'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          insertResult.test1 = res.body;
          expect(insertResult.test1).to.have.all.keys(node);
          done();
        });
      });
    });

    describe('/PUT node id:test2', () => {
      it('it should add a node', (done) => {
        chai.request(app)
        .put('/nodes')
        .send({id:'test2'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          insertResult.test2 = res.body;
          expect(insertResult.test1).to.have.all.keys(node);
          done();
        });
      });
    });

    describe('/GET nodes', () => {
      it('it should GET all the nodes', (done) => {
        chai.request(app)
        .get('/nodes')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.equal(2);
          done();
        });
      });
    });

    describe('/GET test1 node', () => {
      it('it should GET the test1 node', (done) => {
        chai.request(app)
        .get(`/nodes/${insertResult.test1.id}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys(node);
          expect(res.body.id).to.equal('test1');
          done();
        });
      });
    });

    describe('/GET test2 node', () => {
      it('it should GET the test2 node', (done) => {
        chai.request(app)
        .get(`/nodes/${insertResult.test2.id}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys(node);
          expect(res.body.id).to.equal('test2');
          done();
        });
      });
    });

    describe('/PUT testReading1', () => {
      it('it should PUT testReading1 on test1 node', (done) => {
        chai.request(app)
        .put(`/nodes/${insertResult.test1.id}/reading`)
        .send(testReading1)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
      });
    });

    describe('/GET testReading1', () => {
      it('it should GET testReading1 on test1 node', (done) => {
        chai.request(app)
        .get(`/nodes/${insertResult.test1.id}/reading`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body.temperature).to.equal(testReading1.temperature);
          expect(res.body.humidity).to.equal(testReading1.humidity);
          done();
        });
      });
    });

    describe('/PUT testReading2', () => {
      it('it should PUT testReading2 on test1 node', (done) => {
        chai.request(app)
        .put(`/nodes/${insertResult.test1.id}/reading`)
        .send(testReading2)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
      });
    });

    describe('/GET testReading2', () => {
      it('it should GET testReading2 on test1 node', (done) => {
        chai.request(app)
        .get(`/nodes/${insertResult.test1.id}/reading`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body.temperature).to.equal(testReading2.temperature);
          expect(res.body.humidity).to.equal(testReading2.humidity);
          done();
        });
      });
    });

  });

}());
