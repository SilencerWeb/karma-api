const { getUserId, updatePersonsKarma } = require('../../utils');


const createPerson = (_, args, context, info) => {
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
};

const updatePerson = async(_, args, context, info) => {
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
      },
    },
    info,
  );
};

const deletePerson = async(_, args, context, info) => {
  const userId = getUserId(context);

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