// main.js
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const db = require('./db');
const registerHandlers = require('./handlers');
const { logInfo, logError } = require('./utils');

(async () => {
  try {
    // Initialize DB tables
    await db.initTables();

    // Add main admin to admins table if not already present
    await db.addAdmin(config.MAIN_ADMIN_ID);

    // Create bot
    const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

    // Register handlers
    registerHandlers(bot);

    bot.on('polling_error', (error) => {
      logError(`Polling error: ${error.code} - ${error.message}`);
    });

    // Listen for "group_chat_created", "left_chat_member" or "user_block" event to remove user
    // The node-telegram-bot-api doesn't have a direct "user blocked" event,
    // but you could rely on error codes when sending messages, or handle
    // left_chat_member in group scenarios.
    // This is just an example placeholder:
    bot.on('left_chat_member', async (msg) => {
      const userId = msg.left_chat_member.id;
      await db.removeUser(userId);
      logInfo(`User ${userId} removed from database (left chat).`);
    });

    logInfo('Bot is up and running...');
  } catch (error) {
    logError(error);
  }
})();
