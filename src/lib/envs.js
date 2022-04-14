const { AUTH0_CLIENT_SECRET, AUTH0_CLIENT_ID } = process.env

const dev = {
  clientId: 'Dkdvcp6GE7NpgjNvuXVxXkplh73iufVR',
  domain: 'svb-41-dev.eu.auth0.com',
  apiClientId: AUTH0_CLIENT_ID,
  apiClientSecret: AUTH0_CLIENT_SECRET,
}

const prod = {
  clientId: 'pExP09UEbn2yneoyh0woGnWHnrxtbGSy',
  domain: 'svb-41.eu.auth0.com',
  apiClientId: AUTH0_CLIENT_ID,
  apiClientSecret: AUTH0_CLIENT_SECRET,
}

module.exports = process.env.NODE_ENV === 'development' ? dev : prod
