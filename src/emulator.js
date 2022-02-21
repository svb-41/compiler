const MilleFeuille = require('@frenchpastries/millefeuille')
const handler = require('./handler')

const emulator = () => {
  const server = MilleFeuille.create(request => {
    if (request.method !== 'POST') return { statusCode: 404 }
    const event = { body: request.body }
    const context = {} // awsRequestId: ''
    try {
      const data = JSON.parse(event.body)
      console.log('compiling', data.uid, data.name)
    } catch (e) {
      /*balec*/
    }
    return handler.compile(event, context)
  })
  console.log('Server started')
  return server
}

emulator()
