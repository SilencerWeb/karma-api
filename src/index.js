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
        token: jwt.sign({ userId: user.id }, config.APP_SECRET),
        user,
      };
    },

    login: async(_, args, context, info) => {
      const [user] = await context.prisma.query.users(
        {
          where: {
            OR: [
              { email: args.login.toLowerCase(), },
              { nickname: args.login.toLowerCase() },
            ],
          },
        },
      );

      if (!user) {
        throw new Error(`No such user found`);
      }

      const valid = await bcrypt.compare(args.password, user.password);

      if (!valid) {
        throw new Error('Invalid password');
      }

      return {
        token: jwt.sign({ userId: user.id }, config.APP_SECRET),
        user,
      };
    },

    updateUser: async(_, args, context, info) => {
      const userId = getUserId(context);
      const password = args.password ? await bcrypt.hash(args.password, 10) : null;

      return context.prisma.mutation.updateUser(
        {
          where: {
            id: userId,
          },
          data: {
            email: args.email.toLowerCase(),
            password: password,
            nickname: args.nickname.toLowerCase(),
            name: args.name,
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
    updatePerson: (_, args, context, info) => {
      const userId = getUserId(context);

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
      const userId = getUserId(context);

      return context.prisma.mutation.deletePerson(
        {
          where: {
            id: args.id,
          },
        },
        info,
      );
    },

    createAction: async(_, args, context, info) => {
      const userId = getUserId(context);

      const membersIds = await args.members.map(async(member) => {
        return member.isUser ?
          await context.prisma.mutation.createActionMember(
            {
              data: {
                user: {
                  connect: {
                    id: userId,
                  },
                },
                isUser: true,
                side: member.side,
              },
            },
            `{
              id
            }`,
          )
          :
          await context.prisma.mutation.createActionMember(
            {
              data: {
                person: {
                  connect: {
                    id: member.personId,
                  },
                },
                isUser: false,
                side: member.side,
              },
            },
            `{
              id
            }`,
          );
      });

      const resolvedMembersIds = await Promise.all(membersIds);

      await args.members.forEach(async(member) => {
        if (member.isUser || member.side !== args.executors) return;

        const person = await context.prisma.query.person(
          {
            where: {
              id: member.personId,
            },
          },
          `{
            karma
          }`,
        );

        await context.prisma.mutation.updatePerson(
          {
            where: {
              id: member.personId,
            },
            data: {
              karma: args.karma === 'positive' ? person.karma + 1 : person.karma - 1,
            },
          },
        );
      });

      return context.prisma.mutation.createAction(
        {
          data: {
            title: args.title,
            date: args.date,
            description: args.description,
            karma: args.karma,
            executors: args.executors,
            members: {
              connect: resolvedMembersIds,
            },
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
      const userId = getUserId(context);

      const membersIds = await args.members.map(async(member) => {
        return member.isUser ?
          await context.prisma.mutation.createActionMember(
            {
              data: {
                user: {
                  connect: {
                    id: userId,
                  },
                },
                isUser: true,
                side: member.side,
              },
            },
            `{
              id
            }`,
          )
          :
          await context.prisma.mutation.createActionMember(
            {
              data: {
                person: {
                  connect: {
                    id: member.personId,
                  },
                },
                isUser: false,
                side: member.side,
              },
            },
            `{
              id
            }`,
          );
      });

      const resolvedMembersIds = await Promise.all(membersIds);

      const action = await context.prisma.query.action(
        {
          where: {
            id: args.id,
          },
        },
        `{
          members {
            id
          }
        }`,
      );

      const updatedAction = await context.prisma.mutation.updateAction(
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
            members: {
              disconnect: action.members,
              connect: resolvedMembersIds,
            },
          },
        },
        info,
      );

      await action.members.map(async(member) => {
        return await context.prisma.mutation.deleteActionMember(
          {
            where: {
              id: member.id,
            },
          },
        );
      });

      return updatedAction;
    },
    deleteAction: (_, args, context, info) => {
      const userId = getUserId(context);

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
  Subscription: {
    personCreated: {
      subscribe: (parent, args, context, info) => {
        return context.prisma.subscription.person({ where: { mutation_in: ['CREATED'] } }, info);
      },
    },
    personUpdated: {
      subscribe: (parent, args, context, info) => {
        return context.prisma.subscription.person({ where: { mutation_in: ['UPDATED'] } }, info);
      },
    },
    personDeleted: {
      subscribe: (parent, args, context, info) => {
        return context.prisma.subscription.person({ where: { mutation_in: ['DELETED'] } }, info);
      },
    },
    
    actionCreated: {
      subscribe: (parent, args, context, info) => {
        return context.prisma.subscription.action({ where: { mutation_in: ['CREATED'] } }, info);
      },
    },
    actionUpdated: {
      subscribe: (parent, args, context, info) => {
        return context.prisma.subscription.action({ where: { mutation_in: ['UPDATED'] } }, info);
      },
    },
    actionDeleted: {
      subscribe: (parent, args, context, info) => {
        return context.prisma.subscription.action({ where: { mutation_in: ['DELETED'] } }, info);
      },
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
      endpoint: `https://${config.PRISMA_ENDPOINT}`,
      secret: config.PRISMA_SECRET,
    }),
  }),
});

server.start(() => console.log(`GraphQL server is running on http://localhost:4000`));