import {resolve, basename} from 'path'
import {copyFileSync, unlinkSync} from 'fs';

const sshPool = require('../src')

describe('ssh-pool', () => {
  let pool

  beforeEach(() => {
    pool = new sshPool.ConnectionPool(['deploy@test.shipitjs.com'], {
      key: resolve(__dirname, '../../../ssh/id_rsa'),
    })
  })

  it('should run a command remotely', async () => {
    const [{ stdout }] = await pool.run('hostname')
    expect(stdout).toBe('shipit-test\n')
  }, 10000)

  it('should escape command properly', async () => {
    const [{ stdout: first }] = await pool.run('echo $USER')
    expect(first).toBe('deploy\n')

    const [{ stdout: second }] = await pool.run("echo '$USER'")
    expect(second).toBe('$USER\n')
  }, 10000)

  it('should copy to remote', async () => {
    const time = (+new Date);
    const sourceFile = resolve(__dirname, '__fixtures__/test.txt')
    const targetFile = `${__dirname}/__fixtures__/test.${time}.txt`;

    copyFileSync(sourceFile, targetFile);

    try {
      await pool.scpCopyToRemote(targetFile, './',);
      const [{ stdout: first }] = await pool.run(`cd ./ && cat ${basename(targetFile)}`);
      expect(first).toBe('Hello\n')
    } finally {
      unlinkSync(targetFile);
    }

  }, 1e6)
})
