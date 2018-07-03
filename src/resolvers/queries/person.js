const { getUserId } = require('../../utils');


const person = (_, args, context, info) => {
  const userId = getUserId(context);

  return context.prisma.query.person(
    {
      where: {
        id: args.id,
      },
    },
    info,
  );
};

const persons = (_, args, context, info) => {
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
};


module.exports = {
  person,
  persons,
};