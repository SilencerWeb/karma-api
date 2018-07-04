const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  getUserId,
  deleteUserHelper,
} = require('../../utils');

const config = require('../../config');


const signup = async(_, args, context, info) => {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.prisma.mutation.createUser({
    data: {
      email: args.email.toLowerCase(),
      password: password,
      nickname: args.nickname.toLowerCase(),
      name: args.name,
    },
  });

  return {
    token: jwt.sign({ userId: user.id }, config.APP_SECRET),
    user,
  };
};

const login = async(_, args, context, info) => {
  const [user] = await context.prisma.query.users(
    {
      where: {
        OR: [
          { email: args.login.toLowerCase(), },
          { nickname: args.login.toLowerCase() },
        ],
      },
    },
  );

  if (!user) {
    throw new Error(`No such user found`);
  }

  const valid = await bcrypt.compare(args.password, user.password);

  if (!valid) {
    throw new Error('Invalid password');
  }

  return {
    token: jwt.sign({ userId: user.id }, config.APP_SECRET),
    user,
  };
};

const updateUser = async(_, args, context, info) => {
  const userId = getUserId(context);
  const password = args.password ? await bcrypt.hash(args.password, 10) : null;

  return context.prisma.mutation.updateUser(
    {
      where: {
        id: userId,
      },
      data: {
        email: args.email.toLowerCase(),
        password: password,
        nickname: args.nickname.toLowerCase(),
        name: args.name,
      },
    },
    info,
  );
};

const deleteUser = (_, args, context, info) => {
  const userId = getUserId(context);

  return deleteUserHelper(context);
};


module.exports = {
  signup,
  login,
  updateUser,
  deleteUser,
};