const enums = require('./enums');
const master = require('./master');
const transactional = require('./transactional');
const gamification = require('./gamification');

module.exports = {
  // Enums
  ...enums,

  // Master Data Schemas
  ...master,

  // Transactional Data Schemas
  ...transactional,

  // Gamification & Config Schemas
  ...gamification,
};
