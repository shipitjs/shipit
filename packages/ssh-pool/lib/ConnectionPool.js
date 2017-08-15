'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-disable func-names */


var _Connection = require('./Connection');

var _Connection2 = _interopRequireDefault(_Connection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ConnectionPool {
  /**
   * Initialize a new `ConnectionPool` with `connections`.
   * All Connection options are also supported.
   *
   * @param {Connection|string[]} connections Connections
   * @param {object} [options] Options
   */
  constructor(connections, options) {
    this.connections = connections.map(connection => {
      if (connection instanceof _Connection2.default) return connection;
      return new _Connection2.default(_extends({ remote: connection }, options));
    });
  }
}

;['run', 'copy', 'copyToRemote', 'copyFromRemote', 'scpCopyToRemote', 'scpCopyFromRemote'].forEach(method => {
  ConnectionPool.prototype[method] = function (...args) {
    return Promise.all(this.connections.map(connection => connection[method](...args)));
  };
});

exports.default = ConnectionPool;