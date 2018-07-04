const jwt = require('jsonwebtoken');

const config = require('./config');


const getUserId = (context) => {
  const Authorization = context.request.get('Authorization');

  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const { userId } = jwt.verify(token, config.APP_SECRET);

    return userId;
  }

  throw new Error('Not authorized');
};


const deleteActionMemberHelper = async(actionMemberId, context) => {
  return await context.prisma.mutation.deleteActionMember(
    {
      where: {
        id: actionMemberId,
      },
    },
  );
};

const deleteActionMembersHelper = async(actionMembersIds, context) => {
  return await actionMembersIds.map(async(actionMemberId) => {
    return await deleteActionMemberHelper(actionMemberId, context);
  });
};


const deleteActionHelper = async(actionId, context) => {
  const action = await context.prisma.query.action(
    {
      where: {
        id: actionId,
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

  await action.members.forEach(async(member) => {
    if (member.isUser || member.side !== action.executors) return;

    const person = await context.prisma.query.person(
      {
        where: {
          id: member.person.id,
        },
      },
      `
        {
          karma
        }
      `,
    );

    return await context.prisma.mutation.updatePerson(
      {
        where: {
          id: member.person.id,
        },
        data: {
          karma: action.karma === 'positive' ? person.karma - 1 : person.karma + 1,
        },
      },
    );
  });

  const actionMembersIds = action.members.map((member) => {
    return member.id;
  });

  await deleteActionMembersHelper(actionMembersIds, context);

  return await context.prisma.mutation.deleteAction(
    {
      where: {
        id: actionId,
      },
    },
  );
};

const deleteActionsHelper = async(actionsIds, context) => {
  return await actionsIds.map(async(actionId) => {
    return await deleteActionHelper(actionId, context);
  });
};


const deletePersonHelper = async(personId, context) => {
  const userId = getUserId(context);

  const actions = await context.prisma.query.actions(
    {
      where: {
        author: {
          id: userId,
        },
      },
    },
    `
      {
        id
        members {
          user {
            id
          }
          person {
            id
          }
          isUser
        }
      }
    `,
  );

  const filteredActions = actions.filter((action) => {
    return action.members.some((actionMember) => {
      return !actionMember.isUser && actionMember.person.id === personId;
    });
  });

  const filteredActionsIds = filteredActions.map((action) => {
    return action.id;
  });

  await deleteActionsHelper(filteredActionsIds, context);

  return await context.prisma.mutation.deletePerson(
    {
      where: {
        id: personId,
      },
    },
  );
};

const deletePersonsHelper = async(personsIds, context) => {
  return await personsIds.map(async(personId) => {
    return await deletePersonHelper(personId, context);
  });
};


const deleteUserHelper = async(context) => {
  const userId = getUserId(context);

  const persons = await context.prisma.query.persons(
    {
      where: {
        author: {
          id: userId,
        },
      },
    },
    `
      {
        id
      }
    `,
  );

  const personsIds = persons.map((person) => {
    return person.id;
  });

  await deletePersonsHelper(personsIds, context);

  return await context.prisma.mutation.deleteUser(
    {
      where: {
        id: userId,
      },
    },
  );
};


module.exports = {
  getUserId,

  deleteActionMemberHelper,
  deleteActionMembersHelper,

  deleteActionHelper,
  deleteActionsHelper,

  deletePersonHelper,
  deletePersonsHelper,

  deleteUserHelper,
};