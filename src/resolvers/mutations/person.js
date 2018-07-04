const { getUserId } = require('../../utils');


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

const deletePerson = (_, args, context, info) => {
  const userId = getUserId(context);

  return context.prisma.mutation.deletePerson(
    {
      where: {
        id: args.id,
      },
    },
  );
};


module.exports = {
  createPerson,
  updatePerson,
  deletePerson,
};