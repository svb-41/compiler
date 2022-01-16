const compile = require('../src/compile')
const fs = require('fs')
const path = require('path')

jest.setTimeout(30000)

const compiling = async name => {
  const assault = path.resolve(__dirname, `assets/${name}`)
  const code = await fs.promises.readFile(assault, 'utf-8')
  const params = { uid: 'dummy-uid', name, code }
  return await compile(params)
}

test('compiles correctly', async () => compiling('dummy.js'))
test('assault compiles correctly', async () => compiling('assault.ts'))
