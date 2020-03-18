process.env.FORCE_COLOR=0;

module.exports = {
  testEnvironment: 'node',
  roots: ['packages'],
  coverageDirectory: './coverage/',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
