//SHIP
export type Ship = {
  id: string
  position: Position
  stats: Stats
  destroyed: boolean
  team: string
  bulletsFired: number
  weapons: Array<{ bullet: Bullet; amo: number; coolDown: number }>
  shipClass: SHIP_CLASS
  stealth: number
}

export enum SHIP_CLASS {
  DESTROYER = 'DESTROYER',
  FIGHTER = 'FIGHTER',
  STEALTH = 'STEALTH',
  CRUISER = 'CRUISER',
  BOMBER = 'BOMBER',
  SCOUT = 'SCOUT',
  BASE = 'BASE',
}

export type Position = {
  pos: { x: number; y: number }
  direction: number
  speed: number
}

export type Stats = {
  acceleration: number
  turn: number
  size: number
  stealth?: boolean
  detection?: number
}

export type Bullet = {
  position: Position
  stats: Stats
  distance: number
  armed: boolean
  range: number
  id: string
  coolDown: number
  destroyed: boolean
  controller?: BulletController<any>
  builder?: () => (args: any) => BulletController<any>
}

export type RadarResult = {
  position: Position
  size: number
  team: string
  destroyed: boolean
}

export const position = (position: Position) => ({
  ...position,
  pos: {
    x: Math.cos(position.direction) * position.speed + position.pos.x,
    y: Math.sin(position.direction) * position.speed + position.pos.y,
  },
})

//COMM
export type Message = {
  timeSend: number
  content: any
}

export class Channel {
  id: string
  history: Array<Message> = []

  constructor(id: string) {
    this.id = id
  }

  sendMessage(message: Message) {
    this.history.push(message)
  }

  getNewMessages(time: number): Array<Message> {
    return this.history.filter(m => m.timeSend > time)
  }
}

//CONTROLLERS
export type GetInstruction<Data> = (
  ship: Ship,
  radar: Array<RadarResult>,
  data: Data
) => Instruction

export type Comm = {
  getNewMessages: () => Array<Message>
  sendMessage: (message: any) => void
}

export type ControllerArgs = {
  stats: Ship
  radar: Array<RadarResult>
  memory: any
  comm: Comm
  ship: ControlPanel
}

export class Controller<Data> {
  data: any
  shipId: string
  getInstruction: (args: ControllerArgs) => Instruction

  constructor(
    shipId: string,
    getInstruction: (args: ControllerArgs) => Instruction,
    initialData?: Data
  ) {
    this.data = initialData
    this.shipId = shipId
    this.getInstruction = getInstruction
  }

  next = (ship: Ship, comm: Comm, radar: Array<RadarResult>) =>
    this.getInstruction({
      stats: ship,
      radar,
      comm,
      memory: this.data,
      ship: controlPanel(ship),
    })
}

export type BulletControllerArgs = {
  stats: Bullet
  radar: Array<RadarResult>
  memory: any
  bullet: BulletControlPanel
}

export class BulletController<Data> {
  data: any
  getInstruction: (args: BulletControllerArgs) => Instruction

  constructor(
    getInstruction: (args: BulletControllerArgs) => Instruction,
    initialData?: Data
  ) {
    this.data = initialData
    this.getInstruction = getInstruction
  }

  next = (bullet: Bullet, radar: Array<RadarResult>) =>
    this.getInstruction({
      stats: bullet,
      radar,
      memory: this.data,
      bullet: bulletControlPanel(bullet),
    })
}

export enum INSTRUCTION {
  DEFAULT = 'DEFAULT',
  IDLE = 'IDLE',
  TURN = 'TURN',
  FIRE = 'FIRE',
  THRUST = 'THRUST',
}

export type Idle = {
  id: INSTRUCTION.IDLE
}
export type Turn = {
  id: INSTRUCTION.TURN
  arg: number
}
export type Thrust = {
  id: INSTRUCTION.THRUST
  arg: number
}
export type Fire = {
  id: INSTRUCTION.FIRE
  arg: number
  conf?: { target?: { x: number; y: number }; armedTime?: number }
}
export type Instruction = Idle | Turn | Thrust | Fire

export const idle = (): Idle => ({ id: INSTRUCTION.IDLE })
export const turn = (arg: number): Turn => ({ id: INSTRUCTION.TURN, arg })
export const thrust = (arg: number): Thrust => ({ id: INSTRUCTION.THRUST, arg })
export const fire = (
  arg: number,
  conf?: { target?: { x: number; y: number }; armedTime?: number }
): Fire => ({ id: INSTRUCTION.FIRE, arg, conf })

export type ControlPanel = {
  idle: () => Idle
  turn: (arg?: number) => Turn
  turnRight: (arg?: number) => Turn
  turnLeft: (arg?: number) => Turn
  fire: (
    arg?: number,
    target?: { target?: { x: number; y: number }; armedTime?: number }
  ) => Fire
  thrust: (arg?: number) => Thrust
}

export const controlPanel = (ship: Ship): ControlPanel => ({
  idle: () => idle(),
  turn: arg => turn(arg ? arg : ship.stats.turn),
  turnRight: arg => turn(arg ? -arg : -ship.stats.turn),
  turnLeft: arg => turn(arg ? arg : ship.stats.turn),
  fire: (arg, target) => fire(arg ? arg : 0, target),
  thrust: arg => thrust(arg ? arg : ship.stats.acceleration),
})

export type BulletControlPanel = {
  idle: () => Idle
  turn: (arg?: number) => Turn
  turnRight: (arg?: number) => Turn
  turnLeft: (arg?: number) => Turn
  thrust: (arg?: number) => Thrust
}

export const bulletControlPanel = (bullet: Bullet): BulletControlPanel => ({
  idle: () => idle(),
  turn: arg => turn(arg ? arg : bullet.stats.turn),
  turnRight: arg => turn(arg ? -arg : -bullet.stats.turn),
  turnLeft: arg => turn(arg ? arg : bullet.stats.turn),
  thrust: arg => thrust(arg ? arg : bullet.stats.acceleration),
})

//HELPERS
const PI = Math.PI
const TWO_PI = Math.PI * 2

const nextPosition = (num: number) => {
  return (pos: Position): Position => {
    if (num > 0) return nextPosition(num - 1)(position(pos))
    return position(pos)
  }
}

export type Angle = { source: Position; target: Position }
const angle = ({ source, target }: Angle): number => {
  const angle = Math.atan2(
    target.pos.y - source.pos.y,
    target.pos.x - source.pos.x
  )
  return angle < 0 ? angle + TWO_PI : angle
}

export type FindDirection = {
  ship: ControlPanel
  source: Position
  target: Position
  delay?: number
}
const findDirection = ({
  ship,
  source,
  target,
  delay = 1,
}: {
  ship: ControlPanel | BulletControlPanel
  source: Position
  target: Position
  delay?: number
}): Instruction => {
  const deltaAngle =
    (angle({
      source,
      target: nextPosition(delay)(target),
    }) -
      source.direction +
      TWO_PI) %
    TWO_PI
  return ship.turn(-deltaAngle + Math.PI)
}
const aim = ({
  ship,
  source,
  target,
  delay = 1,
  threshold = 0.1,
  weapon = 0,
}: {
  ship: ControlPanel
  source: Position
  target: Position
  delay?: number
  threshold?: number
  weapon?: number
}): Instruction => {
  const deltaAngle =
    (angle({
      source,
      target: nextPosition(delay)(target),
    }) -
      source.direction +
      TWO_PI) %
    TWO_PI
  if (deltaAngle < threshold) return ship.fire(weapon)
  return ship.turn(-deltaAngle + PI)
}

const dist2 = (pos1: Position, pos2: Position) =>
  Math.pow(pos1.pos.x - pos2.pos.x, 2) + Math.pow(pos1.pos.y - pos2.pos.y, 2)
export const helpers = {
  dist2,
  PI,
  TWO_PI,
  nextPosition,
  angle,
  findDirection,
  aim,
}
