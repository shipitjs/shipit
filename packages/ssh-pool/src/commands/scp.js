import { joinCommandArgs, requireArgs } from './util'

export function formatScpCommand({ port, key, proxy, src, dest }) {
  requireArgs(['src', 'dest'], { src, dest }, 'scp')
  let args = ['scp']
  if (proxy) args = [...args, '-o', `"ProxyCommand ${proxy}"`]
  if (port) args = [...args, '-P', port]
  if (key) args = [...args, '-i', key]
  args = [...args, src, dest]
  return joinCommandArgs(args)
}
