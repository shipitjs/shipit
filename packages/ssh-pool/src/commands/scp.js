import { joinCommandArgs, requireArgs } from './util'

export function formatScpCommand({ port, key, src, dest }) {
  requireArgs(['src', 'dest'], { src, dest }, 'scp')
  let args = ['scp']
  if (port) args = [...args, '-P', port]
  if (key) args = [...args, '-i', key]
  args = [...args, src, dest]
  return joinCommandArgs(args)
}
