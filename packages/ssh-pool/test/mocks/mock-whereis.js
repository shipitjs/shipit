/**
 * Creates a mock "whereis" function that accepts an array of predefined locations for binaries
 * @param {Array.<string, string>} paths
 * @returns {Function}
 */
var mockWhereis = function (paths) {
  return function (name, cb) {
    if (typeof paths[name] !== 'undefined')
      cb(null, paths[name]);
    else
      cb(new Error('Could not find ' + name + ' on your system'));
  };
};

module.exports = mockWhereis;