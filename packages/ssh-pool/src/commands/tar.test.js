import { formatTarCommand } from './tar'

describe('tar', () => {
  describe('#formatTarCommand', () => {
    describe('mode: "compress", without "file" or "archive"', () => {
      it('should throw an error', () => {
        expect(() => formatTarCommand({ mode: 'compress' })).toThrow(
          '"file" argument is required in "tar" command',
        )
        expect(() =>
          formatTarCommand({ mode: 'compress', archive: 'foo' }),
        ).toThrow('"file" argument is required in "tar" command')
        expect(() =>
          formatTarCommand({ mode: 'compress', file: 'foo' }),
        ).toThrow('"archive" argument is required in "tar" command')
      })
    })

    describe('mode: "extract", without  "archive"', () => {
      it('should throw an error', () => {
        expect(() => formatTarCommand({ mode: 'extract' })).toThrow(
          '"archive" argument is required in "tar" command',
        )
      })
    })

    describe('without a valid "mode"', () => {
      it('should throw an error', () => {
        expect(() => formatTarCommand({ file: 'foo', archive: 'foo' })).toThrow(
          'mode "undefined" is not valid in "tar" command (valid values: ["extract", "compress"])',
        )
        expect(() =>
          formatTarCommand({ file: 'foo', archive: 'foo', mode: 'foo' }),
        ).toThrow(
          'mode "foo" is not valid in "tar" command (valid values: ["extract", "compress"])',
        )
      })
    })

    it('should support compress mode', () => {
      expect(
        formatTarCommand({
          file: 'file',
          archive: 'file.tar.gz',
          mode: 'compress',
        }),
      ).toBe('tar -czf file.tar.gz file')
    })

    it('should support extract mode', () => {
      expect(
        formatTarCommand({
          file: 'file',
          archive: 'file.tar.gz',
          mode: 'extract',
        }),
      ).toBe('tar --strip-components=1 -xzf file.tar.gz')
    })

    it('should support "excludes"', () => {
      expect(
        formatTarCommand({
          file: 'file',
          archive: 'file.tar.gz',
          mode: 'compress',
          excludes: ['foo'],
        }),
      ).toBe('tar --exclude "foo" -czf file.tar.gz file')
    })
  })
})
