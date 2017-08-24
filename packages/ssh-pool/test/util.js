var expect = require('chai').expect;
var util = require('./../lib/util');

describe('util', function () {

  describe('.resolveMsysGitPath()', function () {

    it('should leave the path as-is if a UNIX path is passed in', function () {
      expect(util.resolveMsysGitPath('/bin/sh')).to.equal('/bin/sh');
      expect(util.resolveMsysGitPath('/some/f:ile')).to.equal('/some/f:ile');
    });

    it('should transform a windows-style path to an msysGit-style path', function () {
      expect(util.resolveMsysGitPath('c:\\')).to.equal('/c/');
      expect(util.resolveMsysGitPath('d:\\')).to.equal('/d/');
      expect(util.resolveMsysGitPath('c:\\Windows\\Users\\Monkey\\file.jpg')).to.equal('/c/Windows/Users/Monkey/file.jpg');
    });
  });
});