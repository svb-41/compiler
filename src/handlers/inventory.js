const AWS = require('../services/aws')
const auth = require('../services/auth')

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
    const inventory = await Promise.all(data.items.map(AWS.DynamoDB.stuff.get))
    return { statusCode: 200, body: JSON.stringify({ ...data, inventory }) }
  } catch (error) {
    console.error(error)
    return { statusCode: 403 }
  }
}
