require('dotenv').config();

const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getUserId } = require('./utils');

const resolvers = {
  Query: {
    user: (_, args, context, info) => {
      const id = getUserId(context);

      return context.prisma.query.user(
        {
          where: {
            id: id,
          },
        },
        info,
      );
    },
    users: (_, args, context, info) => {
      return context.prisma.query.users(
        {
          where: {},
        },
        info,
      );
    },

    person: (_, args, context, info) => {
      const authorId = getUserId(context);

      return context.prisma.query.person(
        {
          where: {
            authorId: authorId,
          },
        },
        info,
      );
    },
    persons: (_, args, context, info) => {
      const authorId = getUserId(context);

      return context.prisma.query.persons(
        {
          where: {
            author: {
              authorId: authorId,
            },
          },
        },
        info,
      );
    },

    action: (_, args, context, info) => {
      const authorId = getUserId(context);

      return context.prisma.query.action(
        {
          where: {
            authorId: authorId,
          },
        },
        info,
      );
    },
    actions: (_, args, context, info) => {
      const authorId = getUserId(context);

      return context.prisma.query.actions(
        {
          where: {
            author: {
              id: authorId,
            },
          },
        },
        info,
      );
    },
  },
  Mutation: {
    signup: async(_, args, context, info) => {
      const password = await bcrypt.hash(args.password, 10);
      const user = await context.prisma.mutation.createUser({
        data: {
          email: args.email,
          nickname: args.nickname,
          password: password,
          name: args.name,
        },
      });

      return {
        token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
        user,
      };
    },

    login: async(_, args, context, info) => {
      const user = await context.prisma.query.user(
        {
          where: {
            email: args.email,
          },
        },
      );

      if (!user) {
        throw new Error(`No such user found for email: ${args.email}`);
      }

      const valid = await bcrypt.compare(args.password, user.password);

      if (!valid) {
        throw new Error('Invalid password');
      }

      return {
        token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
        user,
      };
    },

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
            author: {
              connect: {
                id: args.authorId,
              },
            },
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
            // members: args.members.map((member) => {
            //   return {
            //     person: {
            //       connect: {
            //         id: member.personId,
            //       },
            //     },
            //     side: member.side,
            //   };
            // }),
            author: {
              connect: {
                id: args.authorId,
              },
            },
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
            // members: args.members.map((member) => {
            //   return {
            //     person: {
            //       connect: {
            //         id: member.personId,
            //       },
            //     },
            //     side: member.side,
            //   };
            // }),
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
  AuthPayload: {
    user: async({ user: { id } }, args, context, info) => {
      return context.prisma.query.user({ where: { id } }, info);
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
      endpoint: process.env.PRISMA_ENDPOINT,
    }),
  }),
});

server.start(() => console.log(`GraphQL server is running on http://localhost:4000`));