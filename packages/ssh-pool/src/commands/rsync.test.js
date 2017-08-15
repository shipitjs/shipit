import { formatRsyncCommand } from './rsync'

describe('rsync', () => {
  describe('#formatRsyncCommand', () => {
    describe('without "src" or "dest"', () => {
      it('should throw an error', () => {
        expect(() => formatRsyncCommand({})).toThrow(
          '"src" argument is required in "rsync" command',
        )
        expect(() => formatRsyncCommand({ dest: 'foo' })).toThrow(
          '"src" argument is required in "rsync" command',
        )
        expect(() => formatRsyncCommand({ src: 'foo' })).toThrow(
          '"dest" argument is required in "rsync" command',
        )
      })
    })

    it('should support src and dest', () => {
      expect(formatRsyncCommand({ src: 'file.js', dest: 'foo/' })).toBe(
        'rsync --archive --compress file.js foo/',
      )
    })

    it('should support additionalArgs', () => {
      expect(
        formatRsyncCommand({
          src: 'file.js',
          dest: 'foo/',
          additionalArgs: ['--max-size=10'],
        }),
      ).toBe('rsync --archive --compress --max-size=10 file.js foo/')
    })

    it('should support excludes', () => {
      expect(
        formatRsyncCommand({
          src: 'file.js',
          dest: 'foo/',
          excludes: ['foo'],
        }),
      ).toBe('rsync --archive --compress --exclude "foo" file.js foo/')
    })

    it('should support remoteShell', () => {
      expect(
        formatRsyncCommand({
          src: 'file.js',
          dest: 'foo/',
          remoteShell: 'ssh',
        }),
      ).toBe('rsync --archive --compress --rsh "ssh" file.js foo/')
    })
  })
})
