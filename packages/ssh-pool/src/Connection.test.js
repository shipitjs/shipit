/* eslint-disable import/no-extraneous-dependencies */
import stdMocks from 'std-mocks'
import { exec } from 'child_process'
import { __setPaths__ } from 'which'
import * as util from './util'
import Connection from './Connection'

jest.mock('child_process')
jest.mock('which')
jest.mock('tmp')

describe('Connection', () => {
  beforeEach(() => {
    exec.mockClear()
    util.deprecateV3 = jest.fn()
    __setPaths__({ rsync: '/bin/rsync' })
  })

  afterEach(() => {
    exec.mockClear()
    stdMocks.flush()
    stdMocks.restore()
  })

  describe('constructor', () => {
    it('should accept remote object', () => {
      const connection = new Connection({
        remote: { user: 'user', host: 'host' },
      })
      expect(connection.remote.user).toBe('user')
      expect(connection.remote.host).toBe('host')
    })

    it('should accept remote string', () => {
      const connection = new Connection({ remote: 'user@host' })
      expect(connection.remote.user).toBe('user')
      expect(connection.remote.host).toBe('host')
    })
  })

  describe('#run', () => {
    let connection

    beforeEach(() => {
      connection = new Connection({ remote: 'user@host' })
    })

    it('should call childProcess.exec', async () => {
      await connection.run('my-command -x', { cwd: '/root' })

      expect(exec).toHaveBeenCalledWith(
        'ssh user@host "cd /root > /dev/null; my-command -x; cd - > /dev/null"',
        {
          maxBuffer: 1024000,
        },
        expect.any(Function),
      )
    })

    it('should escape double quotes', async () => {
      await connection.run('echo "ok"')

      expect(exec).toHaveBeenCalledWith(
        'ssh user@host "echo \\"ok\\""',
        {
          maxBuffer: 1024000,
        },
        expect.any(Function),
      )
    })

    it('should return result correctly', async () => {
      const result = await connection.run('my-command -x', { cwd: '/root' })
      expect(result.stdout.toString()).toBe('stdout')
      expect(result.stderr.toString()).toBe('stderr')
    })

    it('should handle tty', async () => {
      await connection.run('sudo my-command -x', { tty: true })

      expect(exec).toHaveBeenCalledWith(
        'ssh -tt user@host "sudo my-command -x"',
        {
          maxBuffer: 1024000,
        },
        expect.any(Function),
      )
    })

    it('should copy args', async () => {
      await connection.run('my-command -x')
      await connection.run('my-command2 -x')

      expect(exec).toHaveBeenCalledWith(
        'ssh user@host "my-command -x"',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
      expect(exec).toHaveBeenCalledWith(
        'ssh user@host "my-command2 -x"',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should use key if present', async () => {
      connection = new Connection({
        remote: 'user@host',
        key: '/path/to/key',
      })

      await connection.run('my-command -x')
      expect(exec).toHaveBeenCalledWith(
        'ssh -i /path/to/key user@host "my-command -x"',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should use port if present', async () => {
      connection = new Connection({ remote: 'user@host:12345' })
      await connection.run('my-command -x')
      expect(exec).toHaveBeenCalledWith(
        'ssh -p 12345 user@host "my-command -x"',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should use StrictHostKeyChecking if present', async () => {
      connection = new Connection({
        remote: 'user@host',
        strict: 'no',
      })
      await connection.run('my-command -x')
      expect(exec).toHaveBeenCalledWith(
        'ssh -o StrictHostKeyChecking=no user@host "my-command -x"',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should use port and key if both are present', async () => {
      connection = new Connection({
        remote: 'user@host:12345',
        key: '/path/to/key',
      })
      await connection.run('my-command -x')
      expect(exec).toHaveBeenCalledWith(
        'ssh -p 12345 -i /path/to/key user@host "my-command -x"',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should log output', async () => {
      const log = jest.fn()
      connection = new Connection({
        remote: 'user@host',
        log,
        stdout: process.stdout,
        stderr: process.stderr,
      })

      stdMocks.use()
      const result = await connection.run('my-command -x')
      result.child.stdout.push('first line\n')
      result.child.stdout.push(null)

      result.child.stderr.push('an error\n')
      result.child.stderr.push(null)

      const output = stdMocks.flush()
      stdMocks.restore()
      expect(log).toHaveBeenCalledWith(
        'Running "%s" on host "%s".',
        'my-command -x',
        'host',
      )

      expect(output.stdout[0].toString()).toBe('@host first line\n')
      expect(output.stderr[0].toString()).toBe('@host-err an error\n')
    })
  })

  describe('#run asUser', () => {
    let connection

    beforeEach(() => {
      connection = new Connection({
        remote: 'user@host',
        asUser: 'test',
      })
    })

    it('should handle sudo as user correctly', async () => {
      await connection.run('my-command -x', { tty: true })

      expect(exec).toHaveBeenCalledWith(
        'ssh -tt user@host "sudo -u test my-command -x"',
        {
          maxBuffer: 1000 * 1024,
        },
        expect.any(Function),
      )
    })

    it('should handle sudo as user without double sudo', () => {
      connection.run('sudo my-command -x', { tty: true })

      expect(exec).toHaveBeenCalledWith(
        'ssh -tt user@host "sudo -u test my-command -x"',
        {
          maxBuffer: 1000 * 1024,
        },
        expect.any(Function),
      )
    })
  })

  describe('#copy', () => {
    let connection

    beforeEach(() => {
      connection = new Connection({ remote: 'user@host' })
    })

    it('should call cmd.spawn', async () => {
      await connection.copy('/src/dir', '/dest/dir')
      expect(exec).toHaveBeenCalledWith(
        'rsync --archive --compress --rsh "ssh" /src/dir user@host:/dest/dir',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should accept "ignores" option', async () => {
      await connection.copy('/src/dir', '/dest/dir', { ignores: ['a', 'b'] })
      expect(exec).toHaveBeenCalledWith(
        'rsync --archive --compress --exclude "a" --exclude "b" --rsh "ssh" /src/dir user@host:/dest/dir',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should accept "direction" option', async () => {
      await connection.copy('/src/dir', '/dest/dir', {
        direction: 'remoteToLocal',
      })
      expect(exec).toHaveBeenCalledWith(
        'rsync --archive --compress --rsh "ssh" user@host:/src/dir /dest/dir',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should accept "rsync" option', async () => {
      await connection.copy('/src/dir', '/dest/dir', {
        rsync: '--info=progress2',
      })
      expect(exec).toHaveBeenCalledWith(
        'rsync --archive --compress --info=progress2 --rsh "ssh" /src/dir user@host:/dest/dir',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    describe('without rsync available', () => {
      beforeEach(() => {
        __setPaths__({})
      })

      it('should use tar+scp', async () => {
        const result = await connection.copy('/a/b/c', '/x/y/z')
        expect(exec.mock.calls[0]).toEqual([
          'cd /a/b && tar -czf foo.tar.gz c',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[1]).toEqual([
          'ssh user@host "mkdir -p /x/y/z"',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[2]).toEqual([
          'cd /a/b && scp foo.tar.gz user@host:/x/y/z',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[3]).toEqual([
          'cd /a/b && rm foo.tar.gz',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[4]).toEqual([
          'ssh user@host "cd /x/y/z && tar --strip-components=1 -xzf foo.tar.gz"',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[5]).toEqual([
          'ssh user@host "cd /x/y/z && rm foo.tar.gz"',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(result.stdout.toString()).toBe('stdout'.repeat(6))
        expect(result.stderr.toString()).toBe('stderr'.repeat(6))
        expect(result.children.length).toBe(6)
      })

      it('should accept "direction" option when using tar+scp', async () => {
        const result = await connection.copy('/a/b/c', '/x/y/z', {
          direction: 'remoteToLocal',
        })
        expect(exec.mock.calls[0]).toEqual([
          'ssh user@host "cd /a/b && tar -czf foo.tar.gz c"',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[1]).toEqual([
          'mkdir -p /x/y/z',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[2]).toEqual([
          'scp user@host:/a/b/foo.tar.gz /x/y/z',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[3]).toEqual([
          'ssh user@host "cd /a/b && rm foo.tar.gz"',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[4]).toEqual([
          'cd /x/y/z && tar --strip-components=1 -xzf foo.tar.gz',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[5]).toEqual([
          'cd /x/y/z && rm foo.tar.gz',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(result.stdout.toString()).toBe('stdout'.repeat(6))
        expect(result.stderr.toString()).toBe('stderr'.repeat(6))
        expect(result.children.length).toBe(6)
      })

      it('should accept port and key', async () => {
        connection = new Connection({
          remote: 'user@host:12345',
          key: '/path/to/key',
        })
        const result = await connection.copy('/a/b/c', '/x/y/z')
        expect(exec.mock.calls[0]).toEqual([
          'cd /a/b && tar -czf foo.tar.gz c',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[1]).toEqual([
          'ssh -p 12345 -i /path/to/key user@host "mkdir -p /x/y/z"',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[2]).toEqual([
          'cd /a/b && scp -P 12345 -i /path/to/key foo.tar.gz user@host:/x/y/z',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[3]).toEqual([
          'cd /a/b && rm foo.tar.gz',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[4]).toEqual([
          'ssh -p 12345 -i /path/to/key user@host "cd /x/y/z && tar --strip-components=1 -xzf foo.tar.gz"',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(exec.mock.calls[5]).toEqual([
          'ssh -p 12345 -i /path/to/key user@host "cd /x/y/z && rm foo.tar.gz"',
          { maxBuffer: 1024000 },
          expect.any(Function),
        ])
        expect(result.stdout.toString()).toBe('stdout'.repeat(6))
        expect(result.stderr.toString()).toBe('stderr'.repeat(6))
        expect(result.children.length).toBe(6)
      })
    })

    it('should use key if present', async () => {
      connection = new Connection({
        remote: 'user@host',
        key: '/path/to/key',
      })
      await connection.copy('/src/dir', '/dest/dir')
      expect(exec).toHaveBeenCalledWith(
        'rsync --archive --compress --rsh "ssh -i /path/to/key" /src/dir user@host:/dest/dir',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should use port if present', async () => {
      connection = new Connection({
        remote: 'user@host:12345',
      })
      await connection.copy('/src/dir', '/dest/dir')
      expect(exec).toHaveBeenCalledWith(
        'rsync --archive --compress --rsh "ssh -p 12345" /src/dir user@host:/dest/dir',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should use StrictHostKeyChecking if present', async () => {
      connection = new Connection({
        remote: 'user@host',
        strict: 'yes',
      })
      await connection.copy('/src/dir', '/dest/dir')
      expect(exec).toHaveBeenCalledWith(
        'rsync --archive --compress --rsh "ssh -o StrictHostKeyChecking=yes" /src/dir user@host:/dest/dir',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should use port and key if both are present', async () => {
      connection = new Connection({
        remote: 'user@host:12345',
        key: '/path/to/key',
      })
      await connection.copy('/src/dir', '/dest/dir')
      expect(exec).toHaveBeenCalledWith(
        'rsync --archive --compress --rsh "ssh -p 12345 -i /path/to/key" /src/dir user@host:/dest/dir',
        { maxBuffer: 1024000 },
        expect.any(Function),
      )
    })

    it('should log output', async () => {
      const log = jest.fn()
      connection = new Connection({
        remote: 'user@host',
        log,
        stdout: process.stdout,
        stderr: process.stderr,
      })

      stdMocks.use()
      const result = await connection.copy('/src/dir', '/dest/dir')
      result.child.stdout.push('first line\n')
      result.child.stdout.push(null)

      result.child.stderr.push('an error\n')
      result.child.stderr.push(null)

      const output = stdMocks.flush()
      expect(log).toHaveBeenCalledWith(
        'Copy "%s" to "%s" via rsync',
        '/src/dir',
        'user@host:/dest/dir',
      )
      expect(output.stdout[0].toString()).toBe('@host first line\n')
      expect(output.stderr[0].toString()).toBe('@host-err an error\n')
    })
  })
})
