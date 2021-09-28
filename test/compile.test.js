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

const assaultCode = `
import {\n  ControllerArgs,\n  Ship,\n  RadarResult,\n  helpers,\n} from '@starships-core'\n\nconst getInstruction = ({ stats, radar, memory, ship }: ControllerArgs) => {\n  if (!memory.initialDir) memory.initialDir = stats.position.direction\n  if (stats.position.speed < 0.1) return ship.thrust()\n\n  const ally = radar.find(\n    (res: RadarResult) =>\n      res.team === stats.team &&\n      Math.abs(\n        helpers.trigo.angle({\n          source: stats.position,\n          target: helpers.trigo.nextPosition(200)(res.position),\n        }) - stats.position.direction\n      ) < 0.1\n  )\n  const closeEnemy = radar\n    .filter((res: RadarResult) => res.team !== stats.team && !res.destroyed)\n    .map((res: RadarResult) => ({\n      res,\n      dist: helpers.dist2(res.position, stats.position),\n    }))\n  if (closeEnemy.length > 0) {\n    const nearestEnemy = closeEnemy.reduce((acc, val) =>\n      acc.dist > val.dist ? val : acc\n    )\n\n    const resAim = helpers.trigo.aim({\n      ship,\n      source: stats.position,\n      target: nearestEnemy.res.position,\n      threshold: 4 / Math.sqrt(nearestEnemy.dist),\n      delay:\n        Math.sqrt(nearestEnemy.dist) /\n        stats.weapons[0]?.bullet.position.speed,\n    })\n    if (resAim.constructor.name === 'Fire' && ally) return ship.idle()\n    return resAim\n  }\n\n  if (memory.initialDir - stats.position.direction)\n    return ship.turn(memory.initialDir - stats.position.direction)\n  return ship.idle()\n}\n\nthis.default = getInstruction\n
`

test('assault compiles correctly', async () => {
  await compile({
    uid: 'dummy-uid',
    name: 'assault-code.ts',
    code: assaultCode,
  })
    .then(console.log)
    .catch(console.error)
})
