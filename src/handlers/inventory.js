const AWS = require('../services/aws')
const auth = require('../services/auth')

module.exports.inventory = async (event, context) => {
  try {
    const au = event.headers.Authorization ?? event.headers.authorization ?? ''
    const username = await auth.get(au.slice(7))
    const data = await AWS.DynamoDB.inventory.get(username)
    const inventory = await Promise.all(data.items.map(AWS.DynamoDB.stuff.get))
    return { statusCode: 200, body: JSON.stringify({ ...data, inventory }) }
  } catch (error) {
    console.error(error)
    return { statusCode: 403 }
  }
}
