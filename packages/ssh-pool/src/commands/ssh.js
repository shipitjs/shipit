import { joinCommandArgs, wrapCommand } from './util'

function wrapCwd(cwd, command) {
  return `cd ${cwd} && ${command} && cd -`
}

export function formatSshCommand({
  port,
  key,
  strict,
  tty,
  remote,
  cwd,
  command,
}) {
  let args = ['ssh']
  if (tty) args = [...args, '-tt']
  if (port) args = [...args, '-p', port]
  if (key) args = [...args, '-i', key]
  if (strict !== undefined)
    args = [...args, '-o', `StrictHostKeyChecking=${strict}`]
  if (remote) args = [...args, remote]
  if (command) args = [...args, wrapCommand(command)]
  const sshCommand = joinCommandArgs(args)
  return cwd ? wrapCwd(cwd, sshCommand) : sshCommand
}
