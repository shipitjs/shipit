import * as util from './util'
import { parseRemote, formatRemote } from './remote'

describe('SSH remote', () => {
  beforeEach(() => {
    util.deprecateV3 = jest.fn()
  })

  describe('#parseRemote', () => {
    it('should return an error if not a string', () => {
      expect(() => {
        parseRemote({})
      }).toThrow('A remote must be a string')
    })

    it('should return an error if empty', () => {
      expect(() => {
        parseRemote('')
      }).toThrow('A remote cannot be an empty string')
    })

    it('should return remote if it has an host', () => {
      const objRemote = { host: 'foo' }
      expect(parseRemote(objRemote)).toBe(objRemote)
    })

    it('should use deploy as default user', () => {
      expect(parseRemote('host')).toEqual({
        host: 'host',
        user: 'deploy',
      })
    })

    it('should parseRemote remote without port', () => {
      expect(parseRemote('user@host')).toEqual({
        user: 'user',
        host: 'host',
      })
    })

    it('should parseRemote remote with port', () => {
      expect(parseRemote('user@host:300')).toEqual({
        user: 'user',
        host: 'host',
        port: 300,
      })
    })
  })

  describe('#format', () => {
    it('should format remote without port', () => {
      expect(formatRemote({ user: 'user', host: 'host' })).toBe('user@host')
    })

    it('should format remote with port', () => {
      expect(formatRemote({ user: 'user', host: 'host', port: 3000 })).toBe(
        'user@host',
      )
    })
  })
})
