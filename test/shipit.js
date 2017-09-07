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
    it('should initialize a simple string ssh pool', function () {
      shipit.config = {servers: ['deploy@my-server']};
      shipit.initSshPool();

      expect(shipit.pools.all).to.be.instanceOf(ConnectionPool);
      expect(shipit.pools.all).to.have.deep.property('.connections[0].remote.user', 'deploy');
      expect(shipit.pools.all).to.have.deep.property('.connections[0].remote.host', 'my-server');
    });

    it('should initialize a simple object ssh pool', function () {
      shipit.config = {servers: [{ user: 'deploy', host: 'my-server'}]};
      shipit.initSshPool();

      expect(shipit.pools.all).to.be.instanceOf(ConnectionPool);
      expect(shipit.pools.all).to.have.deep.property('.connections[0].remote.user', 'deploy');
      expect(shipit.pools.all).to.have.deep.property('.connections[0].remote.host', 'my-server');
    });

    it('should initialize a mixed object ssh pool', function () {
      shipit.config = {servers: ['deploy@my-server1',{ user: 'deploy', host: 'my-server2'}]};
      shipit.initSshPool();

      expect(shipit.pools.all).to.be.instanceOf(ConnectionPool);
      expect(shipit.pools.all).to.have.deep.property('.connections[0].remote.user', 'deploy');
      expect(shipit.pools.all).to.have.deep.property('.connections[0].remote.host', 'my-server1');
      expect(shipit.pools.all).to.have.deep.property('.connections[1].remote.user', 'deploy');
      expect(shipit.pools.all).to.have.deep.property('.connections[1].remote.host', 'my-server2');
    });

    it('should initialize multiple pools based on roles', function () {
      shipit.config = {servers: [
        { user: 'deploy', host: 'webserver', role: 'web' },
        { user: 'deploy', host: 'workerserver', role: 'worker' }
      ]};
      shipit.initSshPool();

      expect(shipit.pools.all).to.be.instanceOf(ConnectionPool);
      expect(shipit.pools.all).to.have.deep.property('.connections[0].remote.user', 'deploy');
      expect(shipit.pools.all).to.have.deep.property('.connections[0].remote.host', 'webserver');
      expect(shipit.pools.all).to.have.deep.property('.connections[1].remote.user', 'deploy');
      expect(shipit.pools.all).to.have.deep.property('.connections[1].remote.host', 'workerserver');
      expect(shipit.pools.web).to.be.instanceOf(ConnectionPool);
      expect(shipit.pools.web).to.have.deep.property('.connections[0].remote.user', 'deploy');
      expect(shipit.pools.web).to.have.deep.property('.connections[0].remote.host', 'webserver');
      expect(shipit.pools.worker).to.be.instanceOf(ConnectionPool);
      expect(shipit.pools.worker).to.have.deep.property('.connections[0].remote.user', 'deploy');
      expect(shipit.pools.worker).to.have.deep.property('.connections[0].remote.host', 'workerserver');
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
      shipit.pools = {
        all: { run: sinon.stub() },
        web: { run: sinon.stub() },
        worker: { run: sinon.stub() }
      };
    });

    it('should run command on all pool', function () {
      shipit.remote('my-command');

      expect(shipit.pools.all.run).to.be.calledWith('my-command');
    });

    it('should cd and run command on all pool', function () {
      shipit.remote('my-command', { cwd: '/my-directory' });

      expect(shipit.pools.all.run).to.be.calledWith('cd "/my-directory" && my-command', {});
    });

    it('should run command on specific pool', function () {
      shipit.remote('my-command', { role: 'web' });

      expect(shipit.pools.web.run).to.be.calledWith('my-command');
    });
  });

  describe('#remoteCopy', function () {
    beforeEach(function () {
      shipit.pools = {
        all: { copy: sinon.stub() },
        web: { copy: sinon.stub() },
        worker: { copy: sinon.stub() }
      };
    });

    it('should run command on all pool', function () {
      shipit.remoteCopy('src', 'dest');

      expect(shipit.pools.all.copy).to.be.calledWith('src', 'dest');
    });

    it('should accept options for shipit.pool.copy on all pool', function () {
      shipit.remoteCopy('src', 'dest', {
        direction: 'remoteToLocal'
      });

      expect(shipit.pools.all.copy).to.be.calledWith('src', 'dest', {
        direction: 'remoteToLocal',
        ignores: [],
        rsync: []
      });
    });

    it('should support options specified in config on all pool', function () {
      shipit.config = {
        ignores: ['foo'],
        rsync: ['--bar']
      };

      shipit.remoteCopy('src', 'dest', {
        direction: 'remoteToLocal'
      });

      expect(shipit.pools.all.copy).to.be.calledWith('src', 'dest', {
        direction: 'remoteToLocal',
        ignores: ['foo'],
        rsync: ['--bar']
      });
    });

    it('should run command on specific pool', function () {
      shipit.remoteCopy('src', 'dest', { role: 'web' });

      expect(shipit.pools.web.copy).to.be.calledWith('src', 'dest');
    });

  });
});
