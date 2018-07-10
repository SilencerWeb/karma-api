const {
  signup,
  login,

  updateUser,
  deleteUser,
} = require('./user');

const {
  createPerson,
  updatePerson,
  deletePerson,
} = require('./person');

const {
  createAction,
  updateAction,
  deleteAction,
} = require('./action');

const {
  uploadFile,
  uploadFiles,
  deleteFile,
} = require('./file');


const Mutation = {
  signup,
  login,

  updateUser,
  deleteUser,

  createPerson,
  updatePerson,
  deletePerson,

  createAction,
  updateAction,
  deleteAction,

  uploadFile,
  uploadFiles,
  deleteFile,
};


module.exports = { Mutation };