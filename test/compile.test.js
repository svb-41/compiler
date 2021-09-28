const compile = require('../src/compile')
jest.setTimeout(30000)

const code = `
import { logger } from '@starships/core'
export default () => {
  logger()
  return { id: 'THRUST', arg: 0.01 }
}
`

test('compiles correctly', async () => {
  const r = await compile({ uid: 'dummy-uid', name: 'dummy-code.js', code })
  console.log(r)
})

const assaultCode =
  "import {\n  ControllerArgs,\n  Ship,\n  Controller,\n  RadarResult,\n  helpers,\n} from '@starships/core'\n\ntype Data = { initialDir?: number }\n\nconst forward = (ship: Ship) => {\n  const shipId = ship.id\n  const getInstruction = ({\n    stats,\n    memory,\n    comm,\n    radar,\n    ship,\n  }: ControllerArgs) => {\n    if (!memory.initialDir) memory.initialDir = stats.position.direction\n    if (stats.position.speed < 0.08) return ship.thrust()\n    if (radar.length > 0) {\n      const enemies = radar\n        .filter(res => res.team !== stats.team && !res.destroyed)\n        .map(res => res.position)\n      if (enemies.length > 0) comm.sendMessage(enemies)\n      const importantTarget = radar\n        .filter(res => res.team !== stats.team && !res.destroyed)\n        .find(enemy => enemy.size === 16)\n      if (importantTarget) {\n        const targetDist = helpers.dist2(\n          stats.position,\n          importantTarget.position\n        )\n        return helpers.aim({\n          ship,\n          source: stats.position,\n          target: importantTarget!.position,\n          threshold: 4 / Math.sqrt(targetDist),\n          delay:\n            Math.sqrt(targetDist) / stats.weapons[0]?.bullet.position.speed,\n        })\n      }\n    }\n    if (memory.initialDir - stats.position.direction === 0) return ship.idle()\n    return ship.turn(memory.initialDir - stats.position.direction)\n  }\n  return new Controller<Data>(shipId, getInstruction, {})\n}\n\nexport default forward\n"

test('assault compiles correctly', async () => {
  await compile({
    uid: 'dummy-uid',
    name: 'assault-code.ts',
    code: assaultCode,
  })
    .then(console.log)
    .catch(console.error)
})
