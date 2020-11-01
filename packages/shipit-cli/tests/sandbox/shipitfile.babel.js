/* eslint-disable no-console */

export default shipit => {
  shipit.initConfig({
    default: {
      key: '/home/travis/.ssh/id_rsa',
    },
    test: {
      servers: 'travis@localhost',
    },
  })

  shipit.task('localHello', async () => {
    await shipit.local('echo "hello"')
  })

  shipit.task('remoteUser', async () => {
    await shipit.remote('echo $USER')
  })

  shipit.task('cwdSsh', async () => {
    await shipit.remote('pwd', { cwd: '~/.ssh' })
  })
}
