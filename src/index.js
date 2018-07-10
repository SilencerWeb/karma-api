require('dotenv').config();

const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const cors = require('cors');

const { resolvers } = require('./resolvers');

const config = require('./config');


const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: `https://${config.PRISMA_ENDPOINT}`,
      secret: config.PRISMA_SECRET,
      debug: config.debug,
    }),
  }),
});


server.express.use('/*', cors());

server.start(() => console.log(`GraphQL server is running on http://localhost:4000`));