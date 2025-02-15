// handlers/index.js
const startHandler = require('./start');
const adminHandler = require('./admin');
const broadcastHandler = require('./broadcast');
const scheduledHandler = require('./scheduled');

module.exports = function registerHandlers(bot) {
  startHandler(bot);
  adminHandler(bot);
  broadcastHandler(bot);
  scheduledHandler(bot);
};
