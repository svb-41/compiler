const compile = require('../src/compile')
const handler = require('../src/handler')
const fs = require('fs')
const path = require('path')

jest.setTimeout(30000)

const readCode = async name => {
  const file = path.resolve(__dirname, `assets/${name}`)
  const code = await fs.promises.readFile(file, 'utf-8')
  return code
}

const compiling = name => async () => {
  const code = await readCode(name)
  const params = { uid: 'dummy-uid', name, code }
  return await compile(params)
}

test('compiles correctly', compiling('dummy.js'))
test('assault compiles correctly', compiling('assault.ts'))

test('handler should return compiled code', async () => {
  const name = 'dummy.js'
  const code = await readCode(name)
  const body = JSON.stringify({ code, uid: 'dummy-uid', name })
  await handler.compile({ body })
})

// test('handler should throw on compilation error', async () => {
//   const name = 'fail.ts'
//   const code = await readCode(name)
//   const body = JSON.stringify({ code, uid: 'dummy-uid', name })
//   const result = await handler.compile({ body })
//   expect(result.statusCode).toBe(500)
//   expect(result.body.length).toBeGreaterThan(0)
// })
