var rewire = require('rewire');
var path = require('path');
var expect = require('chai').use(require('sinon-chai')).expect;
var stdMocks = require('std-mocks');
var childProcess = require('./mocks/child-process');
var mockWhereis = require('./mocks/mock-whereis');
var Connection = rewire('../lib/connection');
var Promise = require('bluebird');

describe('SSH Connection', function () {
  beforeEach(function () {
    Connection.__set__('exec', childProcess.exec.bind(childProcess));
    Connection.__set__('whereis', mockWhereis({rsync: '/bin/rsync'}));
  });

  afterEach(function () {
    childProcess.restore();
  });

  afterEach(function () {
    stdMocks.flush();
    stdMocks.restore();
  });

  describe('constructor', function () {
    it('should accept remote object', function () {
      var connection = new Connection({
        remote: {user: 'user', host: 'host'}
      });
      expect(connection.remote).to.have.property('user', 'user');
      expect(connection.remote).to.have.property('host', 'host');
    });

    it('should accept remote string', function () {
      var connection = new Connection({
        remote: 'user@host'
      });
      expect(connection.remote).to.have.property('user', 'user');
      expect(connection.remote).to.have.property('host', 'host');
    });
  });

  describe('#run', function () {
    var connection;

    beforeEach(function () {
      connection = new Connection({
        remote: 'user@host'
      });
    });

    it('should call childProcess.exec', function (done) {
      connection.run('my-command -x', {cwd: '/root'}, done);

      expect(childProcess.exec).to.be.calledWith(
        'ssh user@host "my-command -x"',
        {cwd: '/root', maxBuffer: 1000 * 1024}
      );
    });

    it('should escape double quotes', function (done) {
      connection.run('echo "ok"', {cwd: '/root'}, done);

      expect(childProcess.exec).to.be.calledWith(
        'ssh user@host "echo \\"ok\\""',
        {cwd: '/root', maxBuffer: 1000 * 1024}
      );
    });

    it('should handle childProcess.exec callback correctly', function (done) {
      connection.run('my-command -x', {cwd: '/root'}, function(err, res) {
        if (err) return done(err);
        expect(res.stdout).to.eql('stdout');
        expect(res.stderr).to.eql('stderr');
        done();
      });
    });

    it('should handle sudo', function (done) {
      connection.run('sudo my-command -x', {cwd: '/root'}, done);

      expect(childProcess.exec).to.be.calledWith(
        'ssh -tt user@host "sudo my-command -x"',
        {cwd: '/root', maxBuffer: 1000 * 1024}
      );
    });

    it('should copy args', function () {
      connection.run('my-command -x', function () {});
      connection.run('my-command2 -x', function () {});

      expect(childProcess.exec).to.be.calledWith(
        'ssh user@host "my-command -x"'
      );

      expect(childProcess.exec).to.be.calledWith(
        'ssh user@host "my-command2 -x"'
      );
    });

    it('should use key if present', function () {
      connection = new Connection({
        remote: 'user@host',
        key: '/path/to/key'
      });
      connection.run('my-command -x', function () {});
      expect(childProcess.exec).to.be.calledWith(
        'ssh -i /path/to/key user@host "my-command -x"'
      );
    });

    it('should use port if present', function () {
      connection = new Connection({
        remote: 'user@host:12345'
      });
      connection.run('my-command -x', function () {});
      expect(childProcess.exec).to.be.calledWith(
        'ssh -p 12345 user@host "my-command -x"'
      );
    });

    it('should use StrictHostKeyChecking if present', function () {
      connection = new Connection({
        remote: 'user@host',
        strict: 'no'
      });
      connection.run('my-command -x', function () {});
      expect(childProcess.exec).to.be.calledWith(
        'ssh -o StrictHostKeyChecking=no user@host "my-command -x"'
      );
    });

    it('should use port and key if both are present', function () {
      connection = new Connection({
        remote: 'user@host:12345',
        key: '/path/to/key'
      });
      connection.run('my-command -x', function () {});
      expect(childProcess.exec).to.be.calledWith(
        'ssh -p 12345 -i /path/to/key user@host "my-command -x"'
      );
    });

    it('should log output', function (done) {
      connection = new Connection({
        remote: 'user@host',
        log: console.log.bind(console),
        stdout: process.stdout,
        stderr: process.stderr
      });

      stdMocks.use();
      connection.run('my-command -x', function (err, res) {
        res.child.stdout.push('first line\n');
        res.child.stdout.push(null);

        res.child.stderr.push('an error\n');
        res.child.stderr.push(null);


        var output = stdMocks.flush();
        expect(output.stdout[0]).to.equal('Running "my-command -x" on host "host".\n');
        expect(output.stdout[1].toString()).to.equal('@host first line\n');

        expect(output.stderr[0].toString()).to.equal('@host-err an error\n');

        stdMocks.restore();
        done();
      });
    });
  });

  describe('#run asUser', function () {
    var connection;

    beforeEach(function () {
      connection = new Connection({
        remote: 'user@host',
        asUser: 'test'
      });
    });

    it('should handle sudo as user correctly', function (done) {
      connection.run('sudo my-command -x', {cwd: '/root'}, done);

      expect(childProcess.exec).to.be.calledWith(
        'ssh -tt user@host "sudo -u test my-command -x"',
        {cwd: '/root', maxBuffer: 1000 * 1024}
      );
    });
    
    it('should handle sudo as user without double sudo', function (done) {
      connection.run('sudo my-command -x', {cwd: '/root'}, done);

      expect(childProcess.exec).to.be.calledWith(
        'ssh -tt user@host "sudo -u test my-command -x"',
        {cwd: '/root', maxBuffer: 1000 * 1024}
      );
    });
  });

  describe('#copy', function () {
    var connection;

    beforeEach(function () {
      connection = new Connection({
        remote: 'user@host'
      });
    });

    it('should call cmd.spawn', function (done) {
      connection.copy('/src/dir', '/dest/dir', function (err) {
        expect(childProcess.exec).to.be.calledWith('rsync -az -e "ssh " /src/dir user@host:/dest/dir');
        done(err);
      });
    });

    it('should accept "ignores" option', function (done) {
      connection.copy('/src/dir', '/dest/dir', {ignores: ['a', 'b']}, function (err) {
        expect(childProcess.exec).to.be.calledWith('rsync --exclude "a" --exclude "b" -az -e ' +
        '"ssh " /src/dir user@host:/dest/dir');
        done(err);
      });
    });

    it('should accept "direction" option', function (done) {
      connection.copy('/src/dir', '/dest/dir', {direction: 'remoteToLocal'}, function (err) {
        expect(childProcess.exec).to.be.calledWith('rsync -az -e "ssh " user@host:/src/dir /dest/dir');
        done(err);
      });
    });

    it('should accept "rsync" option', function (done) {
      connection.copy('/src/dir', '/dest/dir', {rsync: '--info=progress2'}, function (err) {
        expect(childProcess.exec).to.be.calledWith('rsync -az --info=progress2 -e "ssh " /src/dir user@host:/dest/dir');
        done(err);
      });
    });

    it('should use tar+scp where rsync is not available', function(done) {
      Connection.__set__('whereis', mockWhereis({}));
      connection.copy('/src/dir', '/dest/dir', function (err) {
        expect(childProcess.exec).to.be.calledWith('cd /src && tar -czf dir.tmp.tar.gz dir');
        expect(childProcess.exec).to.be.calledWith('ssh user@host "mkdir -p /dest/dir"');
        expect(childProcess.exec).to.be.calledWith('cd /src && scp dir.tmp.tar.gz user@host:/dest/dir');
        expect(childProcess.exec).to.be.calledWith('cd /src && rm dir.tmp.tar.gz');
        expect(childProcess.exec).to.be.calledWith('ssh user@host "cd /dest/dir && tar --strip-components 1 -xzf dir.tmp.tar.gz"');
        expect(childProcess.exec).to.be.calledWith('ssh user@host "cd /dest/dir && rm dir.tmp.tar.gz"');
        done(err);
      });
    });

    it('should transform windows-style paths when calling the scp command when using tar+scp', function(done) {
      Connection.__set__('whereis', mockWhereis({}));
      Connection.__set__('path', require('./support/path.0.12').win32);
      connection.copy('c:\\src\\dir', '/dest/dir', function (err) {
        Connection.__set__('path', path);
        expect(childProcess.exec).to.be.calledWith('cd c:\\src && tar -czf dir.tmp.tar.gz dir');
        expect(childProcess.exec).to.be.calledWith('ssh user@host "mkdir -p /dest/dir"');
        expect(childProcess.exec).to.be.calledWith('cd c:\\src && scp dir.tmp.tar.gz user@host:/dest/dir');
        expect(childProcess.exec).to.be.calledWith('cd c:\\src && rm dir.tmp.tar.gz');
        expect(childProcess.exec).to.be.calledWith('ssh user@host "cd /dest/dir && tar --strip-components 1 -xzf dir.tmp.tar.gz"');
        expect(childProcess.exec).to.be.calledWith('ssh user@host "cd /dest/dir && rm dir.tmp.tar.gz"');
        done(err);
      });
    });

    it('should accept "direction" option when using tar+scp', function(done) {
      Connection.__set__('whereis', mockWhereis({}));
      connection.copy('/src/dir', '/dest/dir', {direction: 'remoteToLocal'}, function (err) {
        expect(childProcess.exec).to.be.calledWith('ssh user@host "cd /src && tar -czf dir.tmp.tar.gz dir"');
        expect(childProcess.exec).to.be.calledWith('mkdir -p /dest/dir');
        expect(childProcess.exec).to.be.calledWith('scp user@host:/src/dir.tmp.tar.gz /dest/dir');
        expect(childProcess.exec).to.be.calledWith('ssh user@host "cd /src && rm dir.tmp.tar.gz"');
        expect(childProcess.exec).to.be.calledWith('cd /dest/dir && tar --strip-components 1 -xzf dir.tmp.tar.gz');
        expect(childProcess.exec).to.be.calledWith('cd /dest/dir && rm dir.tmp.tar.gz');
        done(err);
      });
    });

    it('should accept port and key when using tar+scp', function (done) {
      Connection.__set__('whereis', mockWhereis({}));
      connection = new Connection({
        remote: 'user@host:12345',
        key:    '/path/to/key'
      });
      connection.copy('/src/dir', '/dest/dir', function (err) {
        expect(childProcess.exec).to.be.calledWith('ssh -p 12345 -i /path/to/key user@host "mkdir -p /dest/dir"');
        expect(childProcess.exec).to.be.calledWith('cd /src && scp -P 12345 -i /path/to/key dir.tmp.tar.gz user@host:/dest/dir');
        expect(childProcess.exec).to.be.calledWith('ssh -p 12345 -i /path/to/key user@host "cd /dest/dir && tar --strip-components 1 -xzf dir.tmp.tar.gz"');
        expect(childProcess.exec).to.be.calledWith('ssh -p 12345 -i /path/to/key user@host "cd /dest/dir && rm dir.tmp.tar.gz"');
        done(err);
      });
    });

    it('should use key if present', function (done) {
      connection = new Connection({
        remote: 'user@host',
        key: '/path/to/key'
      });
      connection.copy('/src/dir', '/dest/dir', function (err) {
        expect(childProcess.exec).to.be.calledWith('rsync -az -e "ssh -i /path/to/key" /src/dir user@host:/dest/dir');
        done(err);
      });
    });

    it('should use port if present', function (done) {
      connection = new Connection({
        remote: 'user@host:12345'
      });
      connection.copy('/src/dir', '/dest/dir', function (err) {
        expect(childProcess.exec).to.be.calledWith('rsync -az -e "ssh -p 12345" /src/dir user@host:/dest/dir');
        done(err);
      });
    });

    it('should use StrictHostKeyChecking if present', function (done) {
      connection = new Connection({
        remote: 'user@host',
        strict: 'yes'
      });
      connection.copy('/src/dir', '/dest/dir', function (err) {
        expect(childProcess.exec).to.be.calledWith('rsync -az -e "ssh -o StrictHostKeyChecking=yes" /src/dir user@host:/dest/dir');
        done(err);
      });
    });

    it('should use port and key if both are present', function (done) {
      connection = new Connection({
        remote: 'user@host:12345',
        key: '/path/to/key'
      });
      connection.copy('/src/dir', '/dest/dir', function (err) {
        expect(childProcess.exec).to.be.calledWith('rsync -az -e "ssh -p 12345 -i /path/to/key" /src/dir user@host:/dest/dir');
        done(err);
      });
    });

    it('should log output', function (done) {
      connection = new Connection({
        remote: 'user@host',
        log: console.log.bind(console),
        stdout: process.stdout,
        stderr: process.stderr
      });

      stdMocks.use();
      connection.copy('/src/dir', '/dest/dir', function (err, res) {
        res.child.stdout.push('first line\n');
        res.child.stdout.push(null);

        res.child.stderr.push('an error\n');
        res.child.stderr.push(null);


        var output = stdMocks.flush();
        expect(output.stdout[0]).to.equal('Copy "/src/dir" to "user@host:/dest/dir" via rsync\n');
        expect(output.stdout[1].toString()).to.equal('@host first line\n');

        expect(output.stderr[0].toString()).to.equal('@host-err an error\n');

        stdMocks.restore();
        done();
      });
    });
  });
});
