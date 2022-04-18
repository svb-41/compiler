const auth = require('../services/auth')
const skirmishes = require('../models/skirmishes')
const AWS = require('../services/aws')

module.exports.save = async (event, _context) => {
  try {
    const au = event.headers.Authorization ?? event.headers.authorization ?? ''
    const username = await auth.get(au.slice(7))
    const body = JSON.parse(event.body)
    const areErrors = skirmishes.validate(body)
    if (!areErrors.isValid)
      return { statusCode: 400, body: JSON.stringify(areErrors) }
    await AWS.DynamoDB.skirmishes.put(username, body)
    const recent = await AWS.DynamoDB.skirmishes.get(username)
    return { statusCode: 200, body: JSON.stringify(recent) }
  } catch (error) {
    console.error(error)
    return { statusCode: 403 }
  }
}

module.exports.fight = async (event, _context) => {
  try {
    const au = event.headers.Authorization ?? event.headers.authorization ?? ''
    await auth.get(au.slice(7))
    const { username } = event.pathParameters
    const { size } = event.queryStringParameters
    const s = size === 'small' || size === 'huge'
    const areErrors = typeof username !== 'string' || username.length < 1 || !s
    if (areErrors)
      return { statusCode: 400, body: JSON.stringify('Invalid name or size') }
    const opponent = await AWS.DynamoDB.skirmishes.get(username)
    const id = opponent?.fleets?.[size]
    const f = id ? await AWS.DynamoDB.fleetConfigs.get(id) : 'null'
    const fleet = JSON.parse(f)
    return { statusCode: 200, body: JSON.stringify(fleet) }
  } catch (error) {
    console.error(error)
    return { statusCode: 403 }
  }
}
