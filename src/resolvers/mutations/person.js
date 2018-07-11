const { getUserId, processDelete, updatePersonsKarma } = require('../../utils');


const createPerson = (_, args, context, info) => {
  const userId = getUserId(context);

  return context.prisma.mutation.createPerson(
    {
      data: {
        avatar: args.avatar ? {
          connect: {
            id: args.avatar,
          },
        } : null,
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
};

const updatePerson = async(_, args, context, info) => {
  const userId = getUserId(context);

  const data = {
    name: args.name,
    position: args.position,
    description: args.description,
  };

  if (args.deleteAvatar) {
    const person = await context.prisma.query.person(
      {
        where: {
          id: args.id,
        },
      },
      `
        {
          avatar {
            id
          }
        }
      `,
    );

    if (person.avatar && person.avatar.id) {
      await processDelete(person.avatar.id, context);

      data.avatar = {
        disconnect: {
          id: person.avatar.id,
        },
      };
    }
  } else if (args.avatar) {
    data.avatar = {
      connect: { id: args.avatar },
    };
  }

  const updatedPerson = await context.prisma.mutation.updatePerson(
    {
      where: {
        id: args.id,
      },
      data: data,
    },
    info,
  );

  await context.prisma.mutation.deleteFile(
    {
      where: {
        id: args.id,
      },
    },
    info,
  );

  return updatedPerson;
};

const deletePerson = async(_, args, context, info) => {
  const userId = getUserId(context);

  const person = await context.prisma.query.person(
    {
      where: {
        id: args.id,
      },
    },
    `
      {
        avatar {
          id
        }
      }
    `,
  );

  if (person.avatar && person.avatar.id) {
    const avatarId = person.avatar.id;

    await processDelete(avatarId, context);

    await context.prisma.mutation.deleteFile(
      {
        where: {
          id: avatarId,
        },
      },
      info,
    );
  }

  const deletedPerson = await context.prisma.mutation.deletePerson(
    {
      where: {
        id: args.id,
      },
    },
  );

  await updatePersonsKarma(context);

  return deletedPerson;
};


module.exports = {
  createPerson,
  updatePerson,
  deletePerson,
};