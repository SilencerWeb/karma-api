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


const updatePersonKarma = async(personId, context) => {
  const person = await context.prisma.query.person(
    {
      where: {
        id: personId,
      },
    },
    `
     {
      actions {
        karma
        executors
        members {
          person {
            id
          }
          isUser
          side
        }
      }
     }
    `,
  );

  let karma = 0;

  person.actions.forEach((action) => {
    action.members.forEach((member) => {
      if (!member.isUser && member.person.id === personId && member.side === action.executors) {
        action.karma === 'positive' ? ++karma : --karma;
      }
    });
  });

  return context.prisma.mutation.updatePerson(
    {
      where: {
        id: personId,
      },
      data: {
        karma: karma,
      },
    },
  );
};

const updatePersonsKarma = async(context) => {
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

  return persons.forEach(async(person) => {
    return await updatePersonKarma(person.id, context);
  });
};


module.exports = {
  getUserId,
  updatePersonsKarma,
};