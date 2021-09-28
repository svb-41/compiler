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

const assaultCode = `
import { Controller, ControllerArgs, Ship, RadarResult, helpers } from '@starships/core'

type Data = { initialDir?: number }
const assault = (ship: Ship) => {
  const shipId = ship.id
  const getInstruction = ({ stats, radar, memory, ship }: ControllerArgs) => {
    if (!memory.initialDir) memory.initialDir = stats.position.direction
    if (stats.position.speed < 0.1) return ship.thrust()

    const ally = radar.find(
      (res: RadarResult) =>
        res.team === stats.team &&
        Math.abs(
          helpers.angle({
            source: stats.position,
            target: helpers.nextPosition(200)(res.position),
          }) - stats.position.direction
        ) < 0.1
    )
    const closeEnemy = radar
      .filter((res: RadarResult) => res.team !== stats.team && !res.destroyed)
      .map((res: RadarResult) => ({
        res,
        dist: helpers.dist2(res.position, stats.position),
      }))
    if (closeEnemy.length > 0) {
      const nearestEnemy = closeEnemy.reduce((acc, val) =>
        acc.dist > val.dist ? val : acc
      )

      const resAim = helpers.aim({
        ship,
        source: stats.position,
        target: nearestEnemy.res.position,
        threshold: 4 / Math.sqrt(nearestEnemy.dist),
        delay:
          Math.sqrt(nearestEnemy.dist) /
          stats.weapons[0]?.bullet.position.speed,
      })
      if (resAim.constructor.name === 'Fire' && ally) return ship.idle()
      return resAim
    }

    if (memory.initialDir - stats.position.direction)
      return ship.turn(memory.initialDir - stats.position.direction)
    return ship.idle()
  }
  return new Controller<Data>(shipId, getInstruction, {})
}

export default assault
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
