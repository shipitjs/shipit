'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatSshCommand = formatSshCommand;

var _util = require('./util');

function formatSshCommand({ port, key, strict, tty, remote, command }) {
  let args = ['ssh'];
  if (tty) args = [...args, '-tt'];
  if (port) args = [...args, '-p', port];
  if (key) args = [...args, '-i', key];
  if (strict !== undefined) args = [...args, '-o', `StrictHostKeyChecking=${strict}`];
  if (remote) args = [...args, remote];
  if (command) args = [...args, (0, _util.wrapCommand)(command)];
  return (0, _util.joinCommandArgs)(args);
}