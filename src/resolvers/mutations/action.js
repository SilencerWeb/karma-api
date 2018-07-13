const { getUserId, updatePersonsKarma } = require('../../utils');


const createAction = async(_, args, context, info) => {
  const userId = getUserId(context);

  const personsIds = args.members.filter((member) => {
    return !member.isUser;
  }).map((member) => {
    return {
      id: member.personId,
    };
  });

  const createdAction = await context.prisma.mutation.createAction(
    {
      data: {
        title: args.title,
        date: args.date,
        description: args.description,
        karma: args.karma,
        executors: args.executors,
        persons: {
          connect: personsIds,
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

  await args.members.forEach(async(member) => {
    return await context.prisma.mutation.createActionMember(
      {
        data: {
          person: !member.isUser ? {
            connect: {
              id: member.personId,
            },
          } : null,
          user: member.isUser ? {
            connect: {
              id: userId,
            },
          } : null,
          isUser: member.isUser,
          side: member.side,
          action: {
            connect: {
              id: createdAction.id,
            },
          },
        },
      },
      `
        {
          id
        }
      `,
    );
  });

  await updatePersonsKarma(context);

  return createdAction;
};

const updateAction = async(_, args, context, info) => {
  const userId = getUserId(context);

  const action = await context.prisma.query.action(
    {
      where: {
        id: args.id,
      },
    },
    `
      {
        id
        members {
          id
        }
        persons {
          id
        }
      }
    `,
  );

  const personsIdsForDisconnect = action.persons.filter((person) => {
    return args.members.every((member) => {
      return member.personId !== person.id;
    });
  });

  const personsIdsForConnect = args.members.filter((member) => {
    return !member.isUser && action.persons.every((person) => {
      return member.personId !== person.id;
    });
  }).map((member) => {
    return {
      id: member.personId,
    };
  });

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
        persons: {
          disconnect: personsIdsForDisconnect,
          connect: personsIdsForConnect,
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

  await args.members.forEach(async(member) => {
    return await context.prisma.mutation.createActionMember(
      {
        data: {
          person: !member.isUser ? {
            connect: {
              id: member.personId,
            },
          } : null,
          user: member.isUser ? {
            connect: {
              id: userId,
            },
          } : null,
          isUser: member.isUser,
          side: member.side,
          action: {
            connect: {
              id: action.id,
            },
          },
        },
      },
      `
        {
          id
        }
      `,
    );
  });

  await updatePersonsKarma(context);

  return updatedAction;
};

const deleteAction = async(_, args, context, info) => {
  const userId = getUserId(context);

  const deletedAction = await context.prisma.mutation.deleteAction(
    {
      where: {
        id: args.id,
      },
    },
  );

  await updatePersonsKarma(context);

  return deletedAction;
};


module.exports = {
  createAction,
  updateAction,
  deleteAction,
};