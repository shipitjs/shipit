/* eslint-disable no-console */

const sshPool = require('../')

const pool = new sshPool.ConnectionPool([
  'neoziro@localhost',
  'neoziro@localhost',
])

pool.run('hostname').then(results => {
  console.log(results[0].stdout)
  console.log(results[1].stdout)
})
