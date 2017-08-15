/* eslint-disable no-console */
export const series = tasks =>
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

export function deprecateV3(...args) {
  console.warn(...args, 'It will break in v3.0.0.')
}
