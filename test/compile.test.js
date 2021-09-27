const compile = require('../src/compile')
jest.setTimeout(30000)

const code = `
import { logger } from '@starships-core'
export default () => {
  logger()
  return { id: 'THRUST', arg: 0.01 }
}
`

test('compiles correctly', async () => {
  const r = await compile({ uid: 'dummy-uid', name: 'dummy-code.js', code })
  console.log(r)
})
