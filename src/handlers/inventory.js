const AWS = require('../services/aws')
const auth = require('../services/auth')
const stuff = require('../models/stuff')
const inventoryLib = require('../lib/inventory')

const getUserInventory = async id => {
  const res = await AWS.DynamoDB.inventory.get(id)
  if (res === null) return { items: [], favoritesItems: [] }
  return res
}

module.exports.inventory = async (event, context) => {
  try {
    const au = event.headers.Authorization ?? event.headers.authorization ?? ''
    const username = await auth.get(au.slice(7))
    const data = await getUserInventory(username)
    const items = Array(40)
      .fill(1)
      .map(_ => inventoryLib.randomItem(username))
      .filter(_ => _)
    // const inventory = await Promise.all(data.items.map(AWS.DynamoDB.stuff.get))
    return {
      statusCode: 200,
      body: JSON.stringify({
        ...data,
        inventory: items,
        items: items.map(s => s.id),
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
