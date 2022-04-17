const auth = require('../services/auth')
const stats = require('../models/stats')
const AWS = require('../services/aws')

module.exports.save = async (event, _context) => {
  try {
    const au = event.headers.Authorization ?? event.headers.authorization ?? ''
    const username = await auth.get(au.slice(7))
    const body = JSON.parse(event.body)
    const areErrors = stats.validate(body)
    if (!areErrors.isValid)
      return { statusCode: 400, body: JSON.stringify(areErrors) }
    const total = body.victories + body.defeats
    const ratio = body.victories / total
    await AWS.DynamoDB.stats.put(username, { ...body, total, ratio })
    const recent = await AWS.DynamoDB.stats.get(username)
    return { statusCode: 200, body: JSON.stringify(recent) }
  } catch (error) {
    console.error(error)
    return { statusCode: 403 }
  }
}

module.exports.get = async (event, _context) => {
  try {
    const au = event.headers.Authorization ?? event.headers.authorization ?? ''
    const username = await auth.get(au.slice(7))
    const data = await AWS.DynamoDB.stats.get(username)
    return { statusCode: 200, body: JSON.stringify(data) }
  } catch (error) {
    console.error(error)
    return { statusCode: 403 }
  }
}

module.exports.leaders = async (_event, _context) => {}
