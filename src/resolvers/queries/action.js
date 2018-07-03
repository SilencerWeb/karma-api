const { getUserId } = require('../../utils');


const action = (_, args, context, info) => {
  const userId = getUserId(context);

  return context.prisma.query.action(
    {
      where: {
        id: args.id,
      },
    },
    info,
  );
};

const actions = (_, args, context, info) => {
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
};


module.exports = {
  action,
  actions,
};