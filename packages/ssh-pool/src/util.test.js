import { series } from './util'

describe('util', () => {
  describe('#series', () => {
    it('should run tasks in series', async () => {
      const results = await series([async () => 'foo', async () => 'bar'])
      expect(results).toEqual(['foo', 'bar'])
    })

    it('should handle errors', async () => {
      expect.assertions(1)
      try {
        await series([
          async () => {
            throw new Error('bad')
          },
          async () => 'bar',
        ])
      } catch (error) {
        expect(error.message).toBe('bad')
      }
    })
  })
})
