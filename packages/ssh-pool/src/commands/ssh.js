import { joinCommandArgs, wrapCommand } from './util'

export function formatSshCommand({ port, key, strict, tty, remote, command }) {
  let args = ['ssh']
  if (tty) args = [...args, '-tt']
  if (port) args = [...args, '-p', port]
  if (key) args = [...args, '-i', key]
  if (strict !== undefined)
    args = [...args, '-o', `StrictHostKeyChecking=${strict}`]
  if (remote) args = [...args, remote]
  if (command) args = [...args, wrapCommand(command)]
  return joinCommandArgs(args)
}
