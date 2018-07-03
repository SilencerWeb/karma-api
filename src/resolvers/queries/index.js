const { user, users } = require('./user');
const { person, persons } = require('./person');
const { action, actions } = require('./action');


const Query = {
  user,
  users,

  person,
  persons,

  action,
  actions,
};


module.exports = { Query };