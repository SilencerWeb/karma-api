const {
  getUserId,
  deleteActionHelper,
} = require('../../utils');


const createAction = async(_, args, context, info) => {
  const userId = getUserId(context);

  const createdMembersIds = await args.members.map(async(member) => {
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
        `
          {
            id
          }
        `,
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
        `
          {
            id
          }
        `,
      );
  });

  const resolvedCreatedMembersIds = await Promise.all(createdMembersIds);

  await args.members.forEach(async(member) => {
    if (member.isUser || member.side !== args.executors) return;

    const person = await context.prisma.query.person(
      {
        where: {
          id: member.personId,
        },
      },
      `
        {
          karma
        }
      `,
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
          connect: resolvedCreatedMembersIds,
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

  const createdMembersIds = await args.members.map(async(member) => {
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
        `
          {
            id
          }
        `,
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
        `
          {
            id
          }
        `,
      );
  });

  const resolvedCreatedMembersIds = await Promise.all(createdMembersIds);

  const action = await context.prisma.query.action(
    {
      where: {
        id: args.id,
      },
    },
    `
      {
        karma
        executors
        members {
          id
          person {
            id
          }
          isUser
          side
        }
      }
    `,
  );

  const oldMembersIds = action.members.map((member) => {
    return {
      id: member.id,
    };
  });

  await args.members.forEach(async(member) => {
    if (member.isUser) return;

    const memberId = member.personId;

    const person = await context.prisma.query.person(
      {
        where: {
          id: memberId,
        },
      },
      `
        {
          karma
        }
      `,
    );

    const prevMember = action.members.find((member) => {
      if (member.isUser) return;

      return member.person.id === memberId;
    });

    let personKarma = person.karma;

    if (prevMember && prevMember.side === action.executors) {
      personKarma = action.karma === 'positive' ? personKarma - 1 : personKarma + 1;
    }

    if (member.side === args.executors) {
      personKarma = args.karma === 'positive' ? personKarma + 1 : personKarma - 1;
    }

    return await context.prisma.mutation.updatePerson(
      {
        where: {
          id: member.personId,
        },
        data: {
          karma: personKarma,
        },
      },
    );
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
        members: {
          disconnect: oldMembersIds,
          connect: resolvedCreatedMembersIds,
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

  return deleteActionHelper(args.id, context);
};


module.exports = {
  createAction,
  updateAction,
  deleteAction,
};