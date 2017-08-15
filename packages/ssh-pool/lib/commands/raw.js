'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatRawCommand = formatRawCommand;

var _util = require('./util');

var _util2 = require('../util');

const SUDO_REGEXP = /sudo\s/;

function formatRawCommand({ asUser, command }) {
  let args = [];
  if (asUser) args = [...args, 'sudo', '-u', asUser];
  // Deprecate
  if (asUser && command) {
    if (command.match(SUDO_REGEXP)) {
      (0, _util2.deprecateV3)('You should not use "sudo" and "asUser" options together. Please remove "sudo" from command.');
    }
    args = [...args, command.replace(SUDO_REGEXP, '')];
  } else if (command) args = [...args, command];
  return (0, _util.joinCommandArgs)(args);
}