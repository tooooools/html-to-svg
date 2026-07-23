const fs = require('fs')
const path = require('path')

require(path.resolve(__dirname, 'register-source.js'))

async function main () {
  const files = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.test.js'))
    .sort()

  for (const file of files) {
    const run = require(path.join(__dirname, file))
    await run()
    console.log(`✓ ${file}`)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
