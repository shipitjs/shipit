export default {
  async dir() {
    return {
      path: '/tmp/workspace',
      cleanup: jest.fn(async () => {}),
    }
  }
}
