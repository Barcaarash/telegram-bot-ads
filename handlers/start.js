// handlers/start.js
const db = require('../db');
const config = require('../config');
const { logInfo } = require('../utils');

module.exports = function startHandler(bot) {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    // Register or update user
    await db.upsertUser(chatId);

    // Send welcome message (configurable)
    const welcomeMessage = config.WELCOME_MESSAGE || 'Welcome to our Bot!';
    await bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          // Add any inline buttons you want
          [{ text: 'Visit our website', url: 'https://example.com' }]
        ]
      }
    });

    logInfo(`User started the bot. ID: ${chatId}`);
  });
};
