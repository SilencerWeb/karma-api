const { getUserId } = require('../../utils');


const createAction = async(_, args, context, info) => {
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
};

const updateAction = async(_, args, context, info) => {
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
};

const deleteAction = (_, args, context, info) => {
  const userId = getUserId(context);

  return context.prisma.mutation.deleteAction(
    {
      where: {
        id: args.id,
      },
    },
    info,
  );
};


module.exports = {
  createAction,
  updateAction,
  deleteAction,
};