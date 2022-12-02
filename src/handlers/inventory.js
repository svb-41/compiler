const AWS = require('../services/aws')
const auth = require('../services/auth')
const stuff = require('../models/stuff')
const inventoryLib = require('../lib/inventory')
const { v4: uuid } = require('uuid')

const getUserInventory = async id => {
  const res = await AWS.DynamoDB.inventory.get(id)
  if (res === null) return { items: [], favoritesItems: [] }
  return res
}

const checkRecipe = (recipe, inventory, items) => {
  if (recipe.type === 'ship') {
    const { hull, weapons, thruster, radar, type } = recipe
    const arrayToCheck = [
      hull,
      ...weapons.flatMap(({ weapon, amo }) => [weapon, amo]),
      thruster,
      radar,
    ]
    const notFound = arrayToCheck.find(inventory.items.find(i => i.id === e.id))
    if (notFound) return true
    // const correctHull = items.find(i => i.id == hull).type === 'hull'
    // const correctThruster =
    //   items.find(i => i.id == thruster).type === 'thruster'
    // const correctWeapons = !weapons
    //   .map(w => items.find(i => i.id == w).type === 'weapon')
    //   .find(w => !w)
    // return !correctHull && !correctThruster // && !correctWeapons
  }
}

const buildShip = ({ hull, weapons, thruster, radar }) => ({
  id: uuid(),
  type: 'ship',
  category: 'custom',
  ownStats: {
    weapons: weapons.map(({ weapon, amo }) => ({
      bullet: weapon.ownStats,
      amo: amo.ownStats.amo,
    })),
    stats: {
      size: hull.ownStats.size,
      acceleration: thruster.ownStats.acceleration ?? 0,
      turn: thruster.ownStats.turn ?? 0,
      detection: radar.ownStats.detection ?? 0,
      stealth: hull.ownStats.stealth,
    },
  },
})

const getPieces = (recipe, items) => ({
  hull: items.find(i => i.id === recipe.hull.id),
  thruster: items.find(i => i.id === recipe.thruster.id),
  radar: items.find(i => i.id === recipe.radar.id),
  weapons: recipe.weapons.map(({ weapon, amo }) => ({
    weapon: items.find(i => i.id === recipe.weapon.id),
    amo: items.find(i => i.id === recipe.amo.id),
  })),
})

module.exports.recipe = async (event, context) => {
  try {
    const au = event.headers.Authorization ?? event.headers.authorization ?? ''
    const username = await auth.get(au.slice(7))
    const body = JSON.parse(event.body)
    const userInventory = await getUserInventory(username)
    const { hull, weapons, thruster, type } = body.recipe
    const items = await Promise.all(data.items.map(AWS.DynamoDB.stuff.get))
    if (checkRecipe(recipe, userInventory, items)) return { statusCode: 403 }
    if (recipe.type === 'ship') {
      const ship = buildShip(getPieces(recipe, items))
      await AWS.DynamoDB.stuff.put(ship.id, ship)
      return {
        statusCode: 200,
        body: JSON.stringify(ship),
      }
    }
    return {
      statusCode: 200,
      body: 'Jai pas fini lol',
    }
  } catch (error) {
    console.error(error)
    return { statusCode: 403 }
  }
}

module.exports.inventory = async (event, context) => {
  try {
    const au = event.headers.Authorization ?? event.headers.authorization ?? ''
    const username = await auth.get(au.slice(7))
    const generate = Boolean(event.queryStringParameters?.generate)

    const data = await getUserInventory(username)
    const inventory = await Promise.all(data.items.map(AWS.DynamoDB.stuff.get))

    if (generate) {
      console.log('generate data')
      Array(40)
        .fill(1)
        .map(_ => inventoryLib.randomItem(username))
        .filter(_ => _)
        .forEach(items.push)
      await Promise.all([
        ...items.map(item => AWS.DynamoDB.stuff.put(item.id, item)),
        AWS.DynamoDB.inventory.put(username, {
          items: items.map(({ id }) => id),
          favorites: [],
        }),
      ])
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...data,
        inventory,
      }),
    }
  } catch (error) {
    console.error(error)
    return { statusCode: 403 }
  }
}

const createItem = async (event, context) => {
  try {
    const au = event.headers.Authorization ?? event.headers.authorization ?? ''
    const username = await auth.get(au.slice(7))
    const body = JSON.parse(event.body)
    const areErrors = stuff.validate(body)
    if (!areErrors.isValid)
      return { statusCode: 400, body: JSON.stringify(areErrors) }
  } catch (error) {
    console.error(error)
    return { statusCode: 403 }
  }
}
