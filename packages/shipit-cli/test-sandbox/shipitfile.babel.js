/* eslint-disable no-console */

export default shipit => {
  shipit.initConfig({
    default: {},
    test: {
      servers: 'deploy@myserver.com',
    },
  })

  shipit.task('hello', async () => {
    const result = await shipit.local('echo "hello"')
    if (result.stdout !== 'hello\n') throw new Error('test not passing')
  })
}
