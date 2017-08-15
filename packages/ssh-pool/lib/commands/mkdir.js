'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatMkdirCommand = formatMkdirCommand;

var _util = require('./util');

function formatMkdirCommand({ folder }) {
  (0, _util.requireArgs)(['folder'], { folder }, 'mkdir');
  const args = ['mkdir', '-p', folder];
  return (0, _util.joinCommandArgs)(args);
}