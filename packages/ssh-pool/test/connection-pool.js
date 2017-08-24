var rewire = require('rewire');
var expect = require('chai').use(require('sinon-chai')).expect;
var childProcess = require('./mocks/child-process');
var mockWhereis = require('./mocks/mock-whereis');
var Connection = rewire('../lib/connection');
var ConnectionPool = rewire('../lib/connection-pool');

describe('SSH Connection pool', function () {
  beforeEach(function () {
    Connection.__set__('exec', childProcess.exec.bind(childProcess));
    Connection.__set__('whereis', mockWhereis({rsync: '/bin/rsync'}));
    ConnectionPool.__set__('Connection', Connection);
  });

  afterEach(function () {
    childProcess.restore();
  });

  describe('constructor', function () {
    it('should be possible to create a new ConnectionPool using shorthand syntax', function () {
      var pool = new ConnectionPool(['myserver', 'myserver2']);
      expect(pool.connections[0].remote).to.deep.equal({user: 'deploy', host: 'myserver'});
      expect(pool.connections[1].remote).to.deep.equal({user: 'deploy', host: 'myserver2'});
    });

    it('should be possible to create a new ConnectionPool with long syntax', function () {
      var connection1 = new Connection({remote: 'myserver'});
      var connection2 = new Connection({remote: 'myserver2'});
      var pool = new ConnectionPool([connection1, connection2]);
      expect(pool.connections[0]).to.equal(connection1);
      expect(pool.connections[1]).to.equal(connection2);
    });
  });

  describe('#run', function () {
    var connection1, connection2, pool;

    beforeEach(function () {
      connection1 = new Connection({remote: 'myserver'});
      connection2 = new Connection({remote: 'myserver2'});
      pool = new ConnectionPool([connection1, connection2]);
    });

    it('should run command on each connection', function (done) {
      pool.run('my-command -x', {cwd: '/root'}, function (err, results) {
        if (err) return done(err);

        expect(results[0].stdout).to.equal('stdout');
        expect(results[1].stdout).to.equal('stdout');

        expect(childProcess.exec).to.be.calledWith(
          'ssh deploy@myserver "my-command -x"',
          {cwd: '/root', maxBuffer: 1000 * 1024}
        );

        expect(childProcess.exec).to.be.calledWith(
          'ssh deploy@myserver2 "my-command -x"',
          {cwd: '/root', maxBuffer: 1000 * 1024}
        );

        done();
      });
    });
  });

  describe('#copy', function () {
    var connection1, connection2, pool;

    beforeEach(function () {
      connection1 = new Connection({remote: 'myserver'});
      connection2 = new Connection({remote: 'myserver2'});
      pool = new ConnectionPool([connection1, connection2]);
    });

    it('should run command on each connection', function (done) {

      pool.copy('/src/dir', '/dest/dir', function (err, results) {
        if (err) return done(err);

        expect(results[0].stdout).to.equal('stdout');
        expect(results[1].stdout).to.equal('stdout');

        expect(childProcess.exec).to.be.calledWith(
          'rsync -az -e "ssh " /src/dir deploy@myserver:/dest/dir',
          {maxBuffer: 1000 * 1024, rsync: []}
        );

        expect(childProcess.exec).to.be.calledWith(
          'rsync -az -e "ssh " /src/dir deploy@myserver2:/dest/dir',
          {maxBuffer: 1000 * 1024, rsync: []}
        );

        done();
      });
    });
  });
});
