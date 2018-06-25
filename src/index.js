const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');

const resolvers = {
  Query: {
    user: (_, args, context, info) => {
      return context.prisma.query.user(
        {
          where: {
            id: args.id,
          },
        },
        info,
      );
    },
    
    person: (_, args, context, info) => {
      return context.prisma.query.person(
        {
          where: {
            id: args.id,
          },
        },
        info,
      );
    },
  },
  Mutation: {
    createUser: (_, args, context, info) => {
      return context.prisma.mutation.createUser(
        {
          data: {
            name: args.name,
          },
        },
        info,
      );
    },
    updateUser: (_, args, context, info) => {
      return context.prisma.mutation.updateUser(
        {
          where: {
            id: args.id,
          },
          data: {
            name: args.name,
          },
        },
        info,
      );
    },
    deleteUser: (_, args, context, info) => {
      return context.prisma.mutation.deleteUser(
        {
          where: {
            id: args.id,
          },
        },
        info,
      );
    },

    createPerson: (_, args, context, info) => {
      return context.prisma.mutation.createPerson(
        {
          data: {
            name: args.name,
            position: args.position,
            description: args.description,
            karma: args.karma,
          },
        },
        info,
      );
    },
    updatePerson: (_, args, context, info) => {
      return context.prisma.mutation.updatePerson(
        {
          where: {
            id: args.id,
          },
          data: {
            name: args.name,
            position: args.position,
            description: args.description,
            karma: args.karma,
          },
        },
        info,
      );
    },
    deletePerson: (_, args, context, info) => {
      return context.prisma.mutation.deletePerson(
        {
          where: {
            id: args.id,
          },
        },
        info,
      );
    },

    createAction: (_, args, context, info) => {
      return context.prisma.mutation.createAction(
        {
          data: {
            title: args.title,
            date: args.date,
            description: args.description,
            karma: args.karma,
            executors: args.executors,
          },
        },
        info,
      );
    },
    updateAction: (_, args, context, info) => {
      return context.prisma.mutation.updateAction(
        {
          where: {
            id: args.id,
          },
          data: {
            title: args.title,
            date: args.date,
            description: args.description,
            karma: args.karma,
            executors: args.executors,
          },
        },
        info,
      );
    },
    deleteAction: (_, args, context, info) => {
      return context.prisma.mutation.deleteAction(
        {
          where: {
            id: args.id,
          },
        },
        info,
      );
    },
  },
};

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'https://eu1.prisma.sh/silencerweb-d7143d/karma-api/develop',
    }),
  }),
});

server.start(() => console.log(`GraphQL server is running on http://localhost:4000`));