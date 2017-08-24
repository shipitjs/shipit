var expect = require('chai').expect;
var remote = require('../lib/remote');

describe('SSH remote', function () {
  describe('#parse', function () {
    it('should return an error if empty', function () {
      expect(function () {
        remote.parse('');
      }).to.throw('Host cannot be empty.');
    });

    it('should use deploy as default user', function () {
      var remoteObj = remote.parse('host');
      expect(remoteObj).have.property('user', 'deploy');
      expect(remoteObj).have.property('host', 'host');
      expect(remoteObj).not.have.property('port');
    });

    it('should parse remote without port', function () {
      var remoteObj = remote.parse('user@host');
      expect(remoteObj).have.property('user', 'user');
      expect(remoteObj).have.property('host', 'host');
      expect(remoteObj).have.property('port', undefined);
    });

    it('should parse remote with port', function () {
      var remoteObj = remote.parse('user@host:300');
      expect(remoteObj).have.property('user', 'user');
      expect(remoteObj).have.property('host', 'host');
      expect(remoteObj).have.property('port', 300);
    });
  });

  describe('#format', function () {
    it('should format remote without port', function () {
      expect(remote.format({user: 'user', host: 'host'})).to.equal('user@host');
    });

    it('should format remote with port', function () {
      expect(remote.format({user: 'user', host: 'host', port: 3000})).to.equal('user@host');
    });
  });
});
