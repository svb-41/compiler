const AWS = require('../services/aws')
const stuff = require('../models/stuff')
const { v4: uuid } = require('uuid')
// const svb = require('@svb-41/engine')
const confs = require('../confs/items.json')

// const figther = svb.engine.config.ship.FIGHTER
const metalCategoryLength = confs.categories.metal.length
const fuelCategoryLength = confs.categories.fuel.length
const pieceCategoryLength = confs.categories.piece.length

// const createInventory = owner => ({
//   id: owner,
//   items: [
//     generateItem({
//       owner,
//       stats: {
//         createdAt: new Date().toISOString(),
//         type: 'ship',
//         category: 'fighter',
//         used: false,
//         ownStats: JSON.stringify(fighter),
//       },
//     }),
//   ],
//   favorites: [],
// })

const randomElement = max => Math.floor(Math.random() * max)
const randomBoolean = () => Math.random() > 0.5

const generateItem = ({ owner, stats }) => ({ id: uuid(), owner, ...stats })

const randomItem = owner => {
  const itemTypes = confs.types
  const type = itemTypes[randomElement(itemTypes.length)]
  switch (type) {
    case 'metal':
      return randomMetal(owner)
    case 'fuel':
      return randomFuel(owner)
    case 'piece':
      return randomPiece(owner)
    case 'ship':
      return randomItem(owner)
    default:
  }
}

const randomMetal = owner =>
  generateItem({
    owner,
    stats: {
      createdAt: new Date().toISOString(),
      type: 'metal',
      category: confs.categories.metal[randomElement(metalCategoryLength)],
      version: '1.0.0',
      used: false,
    },
  })

const randomFuel = owner =>
  generateItem({
    owner,
    stats: {
      createdAt: new Date().toISOString(),
      type: 'fuel',
      category: confs.categories.fuel[randomElement(fuelCategoryLength)],
      version: '1.0.0',
      used: false,
    },
  })

const randomPiece = owner => {
  const type = confs.categories.piece[randomElement(pieceCategoryLength)]
  const quality = 1
  switch (type) {
    case 'hull':
      return randomHull(quality)(owner)
    case 'weapon':
      return randomWeapon(quality)(owner)
    case 'radar':
      return randomRadar(quality)(owner)
    case 'thruster':
      return randomThruster(quality)(owner)
    case 'storage':
      return randomStorage(quality)(owner)
    default:
  }
}

const randomHull = quality => owner => {
  let points = randomElement(2 + quality) + 5
  const sizeVal = randomElement(Math.floor(points * 0.8)) + 1
  const size = sizeVal < 5 ? 16 : 32
  points -= sizeVal
  const slots = randomElement(Math.floor(points * 0.8)) + 2
  points -= slots
  const stealthVal = randomElement(Math.floor(points * 0.6)) + 2
  const stealth = stealthVal > 8
  return generateItem({
    owner,
    stats: {
      createdAt: new Date().toISOString(),
      type: 'piece',
      category: 'hull',
      version: '1.0.0',
      used: false,
      ownStats: JSON.stringify({
        size,
        slots,
        stealth,
      }),
    },
  })
}

const generateTorpedo = points => {
  let rest = points
  const range = randomElement(Math.floor(rest * 0.8)) + 1
  rest -= range
  const acceleration = randomElement(Math.floor(rest * 0.6)) + 1
  rest -= acceleration
  const coolDown = randomElement(Math.floor(rest * 0.8)) + 1
  rest -= coolDown
  const homingVal = randomElement(Math.floor(rest))
  const homing = homingVal > 8
  return {
    id: homing ? 'homingTorpedo' : 'torpedo',
    position: {
      pos: { x: 0, y: 0 },
      direction: 0,
      speed: 0,
    },
    stats: { size: 8, acceleration: 0.01 * acceleration, turn: Math.PI / 800 },
    distance: 0,
    armed: false,
    range: range * 1000,
    coolDown: (6 - coolDown) * 1000,
    destroyed: false,
    builder: homing ? 'buildHomingTorpedo' : 'buildTorpedo',
  }
}

const generateBullet = points => {
  let rest = points
  const range = randomElement(Math.floor(rest * 0.8)) + 1
  rest -= range
  const coolDown = randomElement(Math.floor(rest * 0.8)) + 1
  rest -= coolDown
  return {
    id: 'bullet',
    position: {
      pos: { x: 0, y: 0 },
      direction: 0,
      speed: 0,
    },
    stats: { size: 4, acceleration: 0, turn: 0 },
    distance: 0,
    armed: false,
    range: range * 200,
    coolDown: Math.min((8 - coolDown) * 100, 50),
    destroyed: false,
  }
}

const randomWeapon = quality => owner => {
  const isTorpedo = Math.random() + 2 / 1 + quality > 0.5
  const points = randomElement(2 + quality) + 5
  return generateItem({
    owner,
    stats: {
      createdAt: new Date().toISOString(),
      type: 'piece',
      category: 'weapon',
      version: '1.0.0',
      used: false,
      ownStats: JSON.stringify(
        isTorpedo ? generateTorpedo(points) : generateBullet(points)
      ),
    },
  })
}

const randomRadar = quality => owner =>
  generateItem({
    owner,
    stats: {
      createdAt: new Date().toISOString(),
      type: 'piece',
      category: 'radar',
      version: '1.0.0',
      used: false,
      ownStats: JSON.stringify({
        detection: (randomElement(5 + quality) + 1) * 100,
      }),
    },
  })

const randomThruster = quality => owner => {
  let points = randomElement(2 + quality) + 5
  const acceleration = randomElement(Math.floor(points * 0.8)) + 1
  points -= acceleration
  const turn = randomElement(Math.floor(points * 0.8)) + 1
  return generateItem({
    owner,
    stats: {
      createdAt: new Date().toISOString(),
      type: 'piece',
      category: 'thruster',
      version: '1.0.0',
      used: false,
      ownStats: JSON.stringify({
        turn: Math.PI / (Math.abs(5 - turn) * 10),
        acceleration: acceleration * 0.01,
      }),
    },
  })
}

const randomStorage = quality => owner =>
  generateItem({
    owner,
    stats: {
      createdAt: new Date().toISOString(),
      type: 'piece',
      category: 'storage',
      version: '1.0.0',
      used: false,
      ownStats: JSON.stringify({
        amo: randomElement(5 * quality) + 2,
      }),
    },
  })

module.exports.randomItem = randomItem
