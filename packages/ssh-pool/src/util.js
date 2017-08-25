import { exec as baseExec } from 'child_process'

/* eslint-disable no-console */
export const series = async tasks =>
  new Promise((resolve, reject) => {
    const tasksCopy = [...tasks]
    const next = results => {
      if (tasksCopy.length === 0) {
        resolve(results)
        return
      }
      const task = tasksCopy.shift()
      task().then(result => next([...results, result])).catch(reject)
    }
    next([])
  })

export const exec = async (cmd, options, childModifier) =>
  new Promise((resolve, reject) => {
    const child = baseExec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        /* eslint-disable no-param-reassign */
        error.stdout = stdout
        error.stderr = stderr
        error.child = child
        /* eslint-enable no-param-reassign */
        reject(error)
      } else {
        resolve({ child, stdout, stderr })
      }
    })

    if (childModifier) childModifier(child)
  })

export function deprecateV3(...args) {
  console.warn(...args, 'It will break in v3.0.0.')
}
