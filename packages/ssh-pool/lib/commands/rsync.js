'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkRsyncAvailability = undefined;

let checkRsyncAvailability = exports.checkRsyncAvailability = (() => {
  var _ref = _asyncToGenerator(function* () {
    return new Promise(function (resolve) {
      return (0, _whereis2.default)('rsync', function (err) {
        return resolve(!err);
      });
    });
  });

  return function checkRsyncAvailability() {
    return _ref.apply(this, arguments);
  };
})();

exports.formatRsyncCommand = formatRsyncCommand;

var _whereis = require('whereis');

var _whereis2 = _interopRequireDefault(_whereis);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function formatExcludes(excludes) {
  return excludes.reduce((args, current) => [...args, '--exclude', `"${current}"`], []);
}

function formatRsyncCommand({
  src,
  dest,
  excludes,
  additionalArgs,
  remoteShell
}) {
  (0, _util.requireArgs)(['src', 'dest'], { src, dest }, 'rsync');
  let args = ['rsync', '--archive', '--compress'];
  if (additionalArgs) args = [...args, ...additionalArgs];
  if (excludes) args = [...args, ...formatExcludes(excludes)];
  if (remoteShell) args = [...args, '--rsh', (0, _util.wrapCommand)(remoteShell)];
  args = [...args, src, dest];
  return (0, _util.joinCommandArgs)(args);
}