import {
  escapeCommand,
  joinCommandArgs,
  wrapCommand,
  requireArgs,
} from './util'

describe('util', () => {
  describe('#escapeCommand', () => {
    it('should escape double quotes', () => {
      expect(escapeCommand('echo "ok"')).toBe('echo \\"ok\\"')
    })

    it('should escape $', () => {
      expect(escapeCommand('echo $FOO')).toBe('echo \\$FOO')
    })
  })

  describe('#wrapCommand', () => {
    it('should wrap command between double quotes', () => {
      expect(wrapCommand('echo "hello $USER"')).toBe(
        '"echo \\"hello \\$USER\\""',
      )
    })
  })

  describe('#joinCommandArgs', () => {
    it('should join command args', () => {
      expect(joinCommandArgs(['echo', '"foo"'])).toBe('echo "foo"')
    })
  })

  describe('#requireArgs', () => {
    it('should require some args', () => {
      expect(() => requireArgs(['foo'], { a: 'b' }, 'custom')).toThrow(
        '"foo" argument is required in "custom" command',
      )
    })
  })
})
