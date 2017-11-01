export default {
  async dir() {
    return {
      path: '/tmp/workspace-generated',
      cleanup: jest.fn(async () => {}),
    }
  }
}
