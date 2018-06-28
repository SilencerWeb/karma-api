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

module.exports = {
  getUserId,
};