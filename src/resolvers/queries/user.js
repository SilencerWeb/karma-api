const { getUserId } = require('../../utils');


const user = (_, args, context, info) => {
  const userId = getUserId(context);

  return context.prisma.query.user(
    {
      where: {
        id: userId,
      },
    },
    info,
  );
};

const users = (_, args, context, info) => {
  const userId = getUserId(context);

  return context.prisma.query.users(
    {
      where: {},
    },
    info,
  );
};


module.exports = {
  user,
  users,
};