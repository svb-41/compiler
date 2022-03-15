"use strict";
const MilleFeuille = require('@frenchpastries/millefeuille');
const handler = require('./handler');
const _server = MilleFeuille.create(async (request) => {
    if (request.method !== 'POST')
        return { statusCode: 404 };
    const event = { body: request.body };
    const context = {}; // awsRequestId: ''
    return handler.compile(event, context);
});
console.log('Server started');
