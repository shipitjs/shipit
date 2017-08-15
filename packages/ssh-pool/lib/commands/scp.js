'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatScpCommand = formatScpCommand;

var _util = require('./util');

function formatScpCommand({ port, key, src, dest }) {
  (0, _util.requireArgs)(['src', 'dest'], { src, dest }, 'scp');
  let args = ['scp'];
  if (port) args = [...args, '-P', port];
  if (key) args = [...args, '-i', key];
  args = [...args, src, dest];
  return (0, _util.joinCommandArgs)(args);
}