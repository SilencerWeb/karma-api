const { Query } = require('./queries');
const { Mutation } = require('./mutations');
const { Subscription } = require('./subscriptions');
const { AuthPayload } = require('./auth-payloads');


const resolvers = {
  Query,
  Mutation,
  Subscription,
  AuthPayload,
};


module.exports = { resolvers };