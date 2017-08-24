var sinon = require('sinon');
var EventEmitter = require('events').EventEmitter;
var Readable = require('stream').Readable;

/**
 * Define and expose module.
 */

var childProcess = module.exports = {};

/**
 * Spawn.
 */

childProcess.exec = sinon.spy(function (command, options, cb) {
  this.child = new EventEmitter();
  this.child.stderr = new Readable();
  this.child.stderr._read = function () {};
  this.child.stdout = new Readable();
  this.child.stdout._read = function () {};

  process.nextTick(function () {
    cb(null, 'stdout', 'stderr');
  });

  return this.child;
});

/**
 * Restore mock.
 */

childProcess.restore = function () {
  this.exec.reset();
};
