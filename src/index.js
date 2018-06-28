require('dotenv').config();

const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('./config');

const { getUserId } = require('./utils');

const resolvers = {
  Query: {
    user: (_, args, context, info) => {
      const userId = getUserId(context);

      return context.prisma.query.user(
        {
          where: {
            id: userId,
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
      const userId = getUserId(context);

      return context.prisma.query.person(
        {
          where: {
            id: args.id,
            author: {
              id: userId,
            },
          },
        },
        info,
      );
    },
    persons: (_, args, context, info) => {
      const userId = getUserId(context);

      return context.prisma.query.persons(
        {
          where: {
            author: {
              id: userId,
            },
          },
        },
        info,
      );
    },

    action: (_, args, context, info) => {
      const userId = getUserId(context);

      return context.prisma.query.action(
        {
          where: {
            id: args.id,
            author: {
              id: userId,
            },
          },
        },
        info,
      );
    },
    actions: (_, args, context, info) => {
      const userId = getUserId(context);

      return context.prisma.query.actions(
        {
          where: {
            author: {
              id: userId,
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
          email: args.email.toLowerCase(),
          password: password,
          nickname: args.nickname.toLowerCase(),
          name: args.name,
        },
      });

      return {
        token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
        user,
      };
    },

    login: async(_, args, context, info) => {
      // const user = await context.prisma.query.user(
      //   {
      //     where: {
      //       OR: [
      //         { email: args.login, },
      //         { nickname: args.login },
      //       ],
      //     },
      //   },
      // );

      let user = await context.prisma.query.user(
        {
          where: {
            email: args.login.toLowerCase(),
          },
        },
      );

      if (!user) {
        user = await context.prisma.query.user(
          {
            where: {
              nickname: args.login.toLowerCase(),
            },
          },
        );

        if (!user) {
          throw new Error(`No such user found`);
        }
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

    updateUser: async(_, args, context, info) => {
      const userId = getUserId(context);

      const user = await context.prisma.query.user(
        {
          where: {
            id: userId,
          },
        },
      );

      return context.prisma.mutation.updateUser(
        {
          where: {
            id: userId,
          },
          data: {
            email: args.email || user.email.toLowerCase(),
            name: args.name || user.name,
            nickname: args.nickname || user.nickname.toLowerCase(),
          },
        },
        info,
      );
    },
    deleteUser: (_, args, context, info) => {
      const userId = getUserId(context);

      return context.prisma.mutation.deleteUser(
        {
          where: {
            id: userId,
          },
        },
        info,
      );
    },

    createPerson: (_, args, context, info) => {
      const userId = getUserId(context);

      return context.prisma.mutation.createPerson(
        {
          data: {
            name: args.name,
            position: args.position,
            description: args.description,
            karma: 0,
            author: {
              connect: {
                id: userId,
              },
            },
          },
        },
        info,
      );
    },
    updatePerson: async(_, args, context, info) => {
      const userId = getUserId(context);

      const person = await context.prisma.query.person(
        {
          where: {
            id: args.id,
            author: {
              id: userId,
            },
          },
        },
      );

      return context.prisma.mutation.updatePerson(
        {
          where: {
            id: args.userId,
          },
          data: {
            name: args.name || person.name,
            position: args.position || person.position,
            description: args.description || person.description,
            karma: args.karma || person.karma,
          },
        },
        info,
      );
    },
    deletePerson: (_, args, context, info) => {
      const userId = getUserId(context);

      return context.prisma.mutation.deletePerson(
        {
          where: {
            id: args.id,
            author: {
              id: userId,
            },
          },
        },
        info,
      );
    },

    createAction: async(_, args, context, info) => {
      // const members = await args.members.map(async(member) => {
      //   const actionMember = await context.prisma.mutation.createActionMember(
      //     {
      //       data: {
      //         person: {
      //           connect: {
      //             id: member.personId,
      //           },
      //         },
      //         side: member.side,
      //       },
      //     },
      //   );
      //
      //   return actionMember;
      // });
      //
      // const resolvedMembers = await Promise.all(members);

      const userId = getUserId(context);

      return context.prisma.mutation.createAction(
        {
          data: {
            title: args.title,
            date: args.date,
            description: args.description,
            karma: args.karma,
            executors: args.executors,
            // members: resolvedMembers,
            author: {
              connect: {
                id: userId,
              },
            },
          },
        },
        info,
      );
    },
    updateAction: async(_, args, context, info) => {
      // const members = await args.members.map(async(member) => {
      //   const actionMember = await context.prisma.mutation.createActionMember(
      //     {
      //       data: {
      //         person: {
      //           connect: {
      //             id: member.personId,
      //           },
      //         },
      //         side: member.side,
      //       },
      //     },
      //   );
      //
      //   return actionMember;
      // });
      //
      // const resolvedMembers = await Promise.all(members);

      const userId = getUserId(context);

      const action = await context.prisma.query.action(
        {
          where: {
            id: args.id,
            author: {
              id: userId,
            },
          },
        },
      );

      return context.prisma.mutation.updateAction(
        {
          where: {
            id: args.id,
          },
          data: {
            title: args.title || action.title,
            date: args.date || action.date,
            description: args.description || action.description,
            karma: args.karma || action.karma,
            executors: args.executors || action.executors,
            // members: resolvedMembers,
          },
        },
        info,
      );
    },
    deleteAction: (_, args, context, info) => {
      const userId = getUserId(context);

      return context.prisma.mutation.deleteAction(
        {
          where: {
            id: args.id,
            author: {
              id: userId,
            },
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
      endpoint: config.PRISMA_ENDPOINT,
      secret: config.PRISMA_SECRET,
    }),
  }),
});

server.start(() => console.log(`GraphQL server is running on http://localhost:4000`));