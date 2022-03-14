import * as svb from '@svb-41/core'

type Data = { initialDir: number }
type Context = svb.Context<Data>

export const initialData = { initialDir: 0 }
export default (args: Context) => {
  const { stats, memory, comm, radar, ship } = args
  if (!memory.initialDir) memory.initialDir = stats.position.direction
  if (stats.position.speed < 0.08) return ship.thrust()
  if (radar.length > 0) {
    const enemies = svb.radar.closeEnemies(radar, stats.position)
    if (enemies.length > 0) comm.sendMessage(enemies)
    const importantTarget = radar
      .filter(res => res.team !== stats.team && !res.destroyed)
      .find(enemy => enemy.size === 16)
    if (importantTarget) {
      const targetDist = svb.geometry.dist2(
        stats.position,
        importantTarget!.position
      )
      return svb.geometry.aim({
        ship,
        source: stats.position,
        target: importantTarget.position,
        threshold: 4 / Math.sqrt(targetDist),
        delay: Math.sqrt(targetDist) / stats.weapons[0]?.bullet.position.speed,
      })
    }
  }
  if (memory.initialDir - stats.position.direction === 0) return ship.idle()
  return ship.turn(memory.initialDir - stats.position.direction)
}
