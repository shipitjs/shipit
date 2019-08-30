module.exports = {
  testEnvironment: 'node',
  roots: ['packages'],
  coverageDirectory: './coverage/',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
