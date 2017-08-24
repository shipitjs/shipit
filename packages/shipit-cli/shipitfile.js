module.exports = shipit => {
  shipit.initConfig({
    default: {},
    staging: {
      servers: 'myserver.com',
    },
  })

  shipit.task('test', () =>
    shipit.local('echo "hello"').then(res => {
      if (res.stdout !== 'hello\n') throw new Error('test not passing')
    }),
  )

  shipit.task('default', ['test'], () => {
    console.log("Using default task that depends on 'test'")
  })
}
