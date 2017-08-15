'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatTarCommand = formatTarCommand;

var _util = require('./util');

function formatExcludes(excludes) {
  return excludes.reduce((args, current) => [...args, '--exclude', `"${current}"`], []);
}

function formatTarCommand({ file, archive, excludes, mode }) {
  let args = ['tar'];
  switch (mode) {
    case 'compress':
      {
        (0, _util.requireArgs)(['file', 'archive'], { file, archive }, 'tar');
        if (excludes) args = [...args, ...formatExcludes(excludes)];
        args = [...args, '-czf', archive, file];
        return (0, _util.joinCommandArgs)(args);
      }
    case 'extract':
      {
        (0, _util.requireArgs)(['archive'], { file, archive }, 'tar');
        args = [...args, '--strip-components=1'];
        args = [...args, '-xzf', archive];
        return (0, _util.joinCommandArgs)(args);
      }
    default:
      throw new Error(`mode "${mode}" is not valid in "tar" command (valid values: ["extract", "compress"])`);
  }
}