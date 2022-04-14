const auth = require('../services/auth')
const data = require('../lib/data')

module.exports.sync = async (event, _context) => {
  try {
    const au = event.headers.Authorization ?? event.headers.authorization ?? ''
    const username = await auth.get(au.slice(7))
    const body = JSON.parse(event.body)
    const areErrors = data.validate(body)
    if (areErrors) return { statusCode: 400, body: JSON.stringify(areErrors) }
    await data.persist(username, body)
    const recent = await data.fetch(username)
    return { statusCode: 200, body: JSON.stringify(recent) }
  } catch (error) {
    console.error(error)
    return { statusCode: 403 }
  }
}

module.exports.fetch = async (event, _context) => {
  try {
    const au = event.headers.Authorization ?? event.headers.authorization ?? ''
    const username = await auth.get(au.slice(7))
    const recent = await data.fetch(username)
    if (!recent) return { statusCode: 404 }
    return { statusCode: 200, body: JSON.stringify(recent) }
  } catch (error) {
    console.error(error)
    return { statusCode: 403 }
  }
}
