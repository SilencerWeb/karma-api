const { user, users } = require('./user');
const { person, persons } = require('./person');
const { action, actions } = require('./action');
const { file, files } = require('./file');


const Query = {
  user,
  users,

  person,
  persons,

  action,
  actions,

  file,
  files,
};


module.exports = { Query };