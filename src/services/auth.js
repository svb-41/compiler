const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')
const envs = require('../lib/envs')

const jwksUri = `https://${envs.domain}/.well-known/jwks.json`
const client = jwksClient({ jwksUri })
let signingKey = null
let accessToken = null
let expiresAt = null

const toFormUrlEncoded = payload => {
  return Object.entries(payload)
    .map(d => d.map(v => encodeURIComponent(v)).join('='))
    .join('&')
}

const adminToken = async () => {
  if (accessToken && expiresAt < Date.now() - 5000) return accessToken
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: toFormUrlEncoded({
      grant_type: 'client_credentials',
      client_id: envs.apiClientId,
      client_secret: envs.apiClientSecret,
      audience: `https://${envs.domain}/api/v2/`,
    }),
  }
  const response = await fetch(`https://${envs.domain}/oauth/token`, options)
  const data = await response.json()
  if (data.error) throw data.error
  expiresAt = data.expires_in * 1000 + Date.now()
  accessToken = data.access_token
  return accessToken
}

const getKey = (header, callback) => {
  if (signingKey) return callback(null, signingKey)
  return client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err)
    signingKey = key.publicKey || key.rsaPublicKey
    callback(null, signingKey)
  })
}

module.exports.verify = token => {
  return new Promise((resolve, reject) => {
    const options = { audience: 'https://api.svb-41.com' }
    jwt.verify(token, getKey, options, (err, decoded) => {
      if (err) return reject(err)
      return resolve(decoded)
    })
  })
}

module.exports.get = async token => {
  const { sub } = await module.exports.verify(token)
  const accessToken = await adminToken()
  const options = { headers: { Authorization: `Bearer ${accessToken}` } }
  const url = `https://${envs.domain}/api/v2/users/${sub}`
  const response = await fetch(url, options)
  const data = await response.json()
  if (data.error) throw data.error
  return data.username
}

module.exports.byUsername = async username => {
  const accessToken = await adminToken()
  const options = { headers: { Authorization: `Bearer ${accessToken}` } }
  const url = `https://${envs.domain}/api/v2/users?q=username:"${username}"`
  const response = await fetch(url, options)
  const data = await response.json()
  if (data.error) throw data.error
  return data[0]?.user_id ?? null
}
