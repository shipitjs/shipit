var sinon = require('sinon');
var expect = require('chai').use(require('sinon-chai')).expect;
var stream = require('mock-utf8-stream');
var ConnectionPool = require('ssh-pool').ConnectionPool;
var Shipit = require('../lib/shipit');

describe('Shipit', function () {
  var shipit, stdout, stderr;

  beforeEach(function () {
    stdout = new stream.MockWritableStream();
    stderr = new stream.MockWritableStream();
    shipit = new Shipit({
      stdout: stdout,
      stderr: stderr,
      environment: 'stage'
    });
    shipit.stage = 'stage';
  });

  describe('#initialize', function () {
    beforeEach(function () {
      sinon.stub(shipit, 'initSshPool').returns(shipit);
    });

    afterEach(function () {
      shipit.initSshPool.restore();
    });

    it('should add stage and initialize shipit', function () {
      shipit.initialize();
      expect(shipit.initSshPool).to.be.called;
    });
  });

  describe('#initSshPool', function () {
    it('should initialize an ssh pool', function () {
      shipit.config = {servers: ['deploy@my-server']};
      shipit.initSshPool();

      expect(shipit.pool).to.be.instanceOf(ConnectionPool);
      expect(shipit.pool).to.have.deep.property('.connections[0].remote.user', 'deploy');
      expect(shipit.pool).to.have.deep.property('.connections[0].remote.host', 'my-server');
    });
  });

  describe('#initConfig', function () {
    it('should initialize config', function () {
      shipit.initConfig({default: {foo: 'bar', servers: ['1', '2']}, stage: {kung: 'foo', servers: ['3']}});

      expect(shipit.config).to.be.deep.equal({
        branch: 'master',
        keepReleases: 5,
        foo: 'bar',
        kung: 'foo',
        servers: ['3'],
        shallowClone: false
      });
    });
  });

  describe('#local', function () {
    it('should wrap and log to stdout', function () {
      stdout.startCapture();
      return shipit.local('echo "hello"').then(function (res) {
        expect(stdout.capturedData).to.equal('@ hello\n');
        expect(res).to.have.property('stdout');
        expect(res).to.have.property('stderr');
        expect(res).to.have.property('child');
      });
    });
  });

  describe('#remote', function () {
    beforeEach(function () {
      shipit.pool = {run: sinon.stub()};
    });

    it('should run command on pool', function () {
      shipit.remote('my-command');

      expect(shipit.pool.run).to.be.calledWith('my-command');
    });

    it('should cd and run command on pool', function () {
      shipit.remote('my-command', {cwd: '/my-directory'});

      expect(shipit.pool.run).to.be.calledWith('cd "/my-directory" && my-command', {});
    });
  });

  describe('#remoteCopy', function () {
    beforeEach(function () {
      shipit.pool = {copy: sinon.stub()};
    });

    it('should run command on pool', function () {
      shipit.remoteCopy('src', 'dest');

      expect(shipit.pool.copy).to.be.calledWith('src', 'dest');
    });

    it('should accept options for shipit.pool.copy', function () {
      shipit.remoteCopy('src', 'dest', {
        direction: 'remoteToLocal'
      });

      expect(shipit.pool.copy).to.be.calledWith('src', 'dest', {
        direction: 'remoteToLocal',
        ignores: [],
        rsync: []
      });
    });

    it('should support options specified in config', function () {
      shipit.config = {
        ignores: ['foo'],
        rsync: ['--bar']
      };

      shipit.remoteCopy('src', 'dest', {
        direction: 'remoteToLocal'
      });

      expect(shipit.pool.copy).to.be.calledWith('src', 'dest', {
        direction: 'remoteToLocal',
        ignores: ['foo'],
        rsync: ['--bar']
      });
    });
  });
});
