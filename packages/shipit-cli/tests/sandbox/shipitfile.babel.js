/* eslint-disable no-console */

export default shipit => {
  shipit.initConfig({
    default: {},
    test: {
      servers: 'deploy@test.shipitjs.com',
    },
  })

  shipit.task('localHello', async () => {
    await shipit.local('echo "hello"')
  })

  shipit.task('remoteUser', async () => {
    await shipit.remote('echo $USER')
  })
}
