const {
  personCreated,
  personUpdated,
  personDeleted,
} = require('./person');

const {
  actionCreated,
  actionUpdated,
  actionDeleted,
} = require('./action');


const Subscription = {
  personCreated,
  personUpdated,
  personDeleted,

  actionCreated,
  actionUpdated,
  actionDeleted,
};


module.exports = { Subscription };