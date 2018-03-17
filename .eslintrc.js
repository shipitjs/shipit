module.exports = {
  root: true,
  extends: ['airbnb-base', 'prettier'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
  },
  env: {
    jest: true,
  },
  rules: {
    'class-methods-use-this': 'off',
    'import/prefer-default-export': 'off',
  },
}
