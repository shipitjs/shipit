export function start(shipit, ...tasks) {
  return new Promise((resolve, reject) => {
    shipit.start(...tasks, err => {
      if (err) reject(err)
      else resolve()
    })
  })
}
