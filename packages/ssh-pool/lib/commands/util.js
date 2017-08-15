'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.escapeCommand = escapeCommand;
exports.wrapCommand = wrapCommand;
exports.joinCommandArgs = joinCommandArgs;
exports.requireArgs = requireArgs;
function escapeCommand(command) {
  return command.replace(/"/g, '\\"');
}

function wrapCommand(command) {
  return `"${escapeCommand(command)}"`;
}

function joinCommandArgs(args) {
  return args.join(' ');
}

function requireArgs(requiredArgs, args, command) {
  requiredArgs.forEach(required => {
    if (args[required] === undefined) {
      throw new Error(`"${required}" argument is required in "${command}" command`);
    }
  });
}