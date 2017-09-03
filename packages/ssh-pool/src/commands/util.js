export function escapeCommand(command) {
  return command.replace(/"/g, '\\"').replace(/\$/g, '\\$')
}

export function wrapCommand(command) {
  return `"${escapeCommand(command)}"`
}

export function joinCommandArgs(args) {
  return args.join(' ')
}

export function requireArgs(requiredArgs, args, command) {
  requiredArgs.forEach(required => {
    if (args[required] === undefined) {
      throw new Error(
        `"${required}" argument is required in "${command}" command`,
      )
    }
  })
}
