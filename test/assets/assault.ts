import * as svb from '@svb-41/core'

type Data = { initialDir?: number }
type Context = svb.Context<Data>
const FIRE = svb.Instruction.FIRE

export const initialData: Data = {}
export default ({ stats, radar, memory, ship }: Context) => {
  if (!memory.initialDir) memory.initialDir = stats.position.direction
  if (stats.position.speed < 0.1) return ship.thrust()

  const ally = radar.find(res => {
    const isSameTeam = res.team === stats.team
    if (!isSameTeam) return false
    const source = stats.position
    const target = svb.geometry.nextPosition(200)(res.position)
    const finalAngle = svb.geometry.angle({ source, target })
    const direction = finalAngle - stats.position.direction
    return Math.abs(direction) < 0.1
  })

  const near = svb.radar.nearestEnemy(radar, stats.position)
  if (near) {
    const source = stats.position
    const target = near.enemy.position
    const threshold = 4 / Math.sqrt(near.dist2)
    const speed = stats.weapons[0]?.bullet.position.speed
    const delay = Math.sqrt(near.dist2) / speed
    const resAim = svb.geometry.aim({ ship, source, target, threshold, delay })
    if (resAim.id === FIRE && ally) return ship.idle()
    return resAim
  }

  if (memory.initialDir - stats.position.direction)
    return ship.turn(memory.initialDir - stats.position.direction)
  return ship.idle()
}
