const AWS = require('../services/aws')
const auth = require('../services/auth')
const Identicon = require('identicon.js')
const crypto = require('crypto')

const renderProfilePicture = async username_ => {
  const [username] = username_.split('.')
  const uid = await auth.byUsername(username)
  if (!uid) return { statusCode: 404, body: 'Not Found' }
  const hash = crypto.createHash('SHA256').update(uid).digest().toString()
  const data = new Identicon(hash, { format: 'svg', margin: 0.2 })
  const svg = data.toString(true)
  return {
    statusCode: 200,
    body: svg,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, immutable, max-age=525600',
    },
  }
}

module.exports.profile = async (event, _context) => {
  try {
    const { username } = event.pathParameters
    if (username.endsWith('.svg')) {
      return renderProfilePicture(username)
    } else {
      const profile = await AWS.DynamoDB.preferences.get(username)
      if (!profile) return { statusCode: 404, body: 'Not Found' }
      const { color } = profile
      return { statusCode: 200, body: JSON.stringify(color) }
    }
  } catch (error) {
    console.log(error)
    return { statusCode: 500, body: JSON.stringify('Internal Error') }
  }
}
