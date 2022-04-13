const MilleFeuille = require('@frenchpastries/millefeuille')
const { routes, post, notFound } = require('@frenchpastries/assemble')
const { compile } = require('./handlers/compile')
const { sync } = require('./handlers/sync')

const prepare = fun => request => {
  const event = { body: request.body }
  const context = {}
  return fun(event, context)
}

const allRoutes = routes([
  post('/compile', prepare(compile)),
  post('/sync', prepare(sync)),
  notFound(() => ({ statusCode: 404 })),
])

MilleFeuille.create(allRoutes)
console.log('Server started')
