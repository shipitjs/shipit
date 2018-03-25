import path from 'path'

const sshPool = require('../src')

describe('ssh-pool', () => {
  let pool

  beforeEach(() => {
    pool = new sshPool.ConnectionPool(['deploy@test.shipitjs.com'], {
      key: './ssh/id_rsa',
    })
  })

  it('should run a command remotely', async () => {
    const [{ stdout }] = await pool.run('hostname')
    expect(stdout).toBe('shipit-test\n')
  })

  it('should escape command properly', async () => {
    const [{ stdout: first }] = await pool.run('echo $USER')
    expect(first).toBe('deploy\n')

    const [{ stdout: second }] = await pool.run("echo '$USER'")
    expect(second).toBe('$USER\n')
  })

  it(
    'should copy to remote',
    async () => {
      await pool.scpCopyToRemote(
        path.resolve(__dirname, '__fixtures__/test.txt'),
        './',
      )
    },
    20000,
  )
})
