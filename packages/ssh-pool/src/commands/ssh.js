import { joinCommandArgs, wrapCommand } from './util'

function wrapCwd(cwd, command) {
  return `cd ${cwd} > /dev/null; ${command}; cd - > /dev/null`
}

export function formatSshCommand({
  port,
  key,
  strict,
  tty,
  remote,
  cwd,
  command,
  verbose,
}) {
  let args = ['ssh']
  if (verbose) args = [...args, '-v']
  if (tty) args = [...args, '-tt']
  if (port) args = [...args, '-p', port]
  if (key) args = [...args, '-i', key]
  if (strict !== undefined)
    args = [...args, '-o', `StrictHostKeyChecking=${strict}`]
  if (remote) args = [...args, remote]

  const cwdCommand = cwd ? wrapCwd(cwd, command) : command
  if (command) args = [...args, wrapCommand(cwdCommand)]
  return joinCommandArgs(args)
}
