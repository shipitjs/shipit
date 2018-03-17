import { deprecateV3 } from './util'

export function parseRemote(remote) {
  if (remote && remote.host) return remote
  if (typeof remote !== 'string') throw new Error('A remote must be a string')
  if (remote === '') throw new Error('A remote cannot be an empty string')

  const matches = remote.match(/(([^@:]+)@)?([^@:]+)(:(.+))?/)

  if (matches) {
    const [, , user, host, , port] = matches
    const options = { user, host }
    if (port) options.port = Number(port)
    if (!user) {
      deprecateV3(
        'Default user "deploy" is deprecated, please specify it explictly.',
      )
      options.user = 'deploy'
    }
    return options
  }

  return { user: 'deploy', host: remote }
}

export function formatRemote({ user, host }) {
  return `${user}@${host}`
}
