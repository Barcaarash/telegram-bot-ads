// handlers/admin.js
const db = require('../db');
const config = require('../config');
const { logInfo, logError } = require('../utils');

module.exports = function adminHandler(bot) {
  bot.onText(/\/admin/, async (msg) => {
    const chatId = msg.chat.id;
    if (!(await db.isAdmin(chatId))) {
      return bot.sendMessage(chatId, 'Access denied. You are not an admin.');
    }
    showAdminMenu(chatId);
  });

  // Admin command to view statistics
  bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    if (!(await db.isAdmin(chatId))) return;
    const userCount = await db.countUsers();
    bot.sendMessage(chatId, `Total registered users: ${userCount}`);
  });

  // Admin command to add an admin (only main admin can do this)
  bot.onText(/\/addadmin (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const newAdminId = match[1];

    // Check if main admin
    if (chatId != config.MAIN_ADMIN_ID) {
      return bot.sendMessage(chatId, 'Only the main admin can add new admins.');
    }

    try {
      await db.addAdmin(newAdminId);
      bot.sendMessage(chatId, `User ${newAdminId} added as admin.`);
      bot.sendMessage(newAdminId, `You have been granted admin access.`);
    } catch (err) {
      logError(err);
      bot.sendMessage(chatId, 'Failed to add admin.');
    }
  });

  // Admin command to remove an admin (only main admin can do this)
  bot.onText(/\/removeadmin (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const removeId = match[1];

    if (chatId != config.MAIN_ADMIN_ID) {
      return bot.sendMessage(chatId, 'Only the main admin can remove admins.');
    }

    try {
      await db.removeAdmin(removeId);
      bot.sendMessage(chatId, `Admin ${removeId} removed.`);
      bot.sendMessage(removeId, `Your admin privileges have been revoked.`);
    } catch (err) {
      logError(err);
      bot.sendMessage(chatId, 'Failed to remove admin.');
    }
  });

  // Admin command to change the welcome message
  bot.onText(/\/setwelcome (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!(await db.isAdmin(chatId))) return;
    const newWelcomeMessage = match[1];

    // Update in config (for demonstration). In production, store in DB.
    config.WELCOME_MESSAGE = newWelcomeMessage;
    bot.sendMessage(chatId, `Welcome message updated to: ${newWelcomeMessage}`);
  });

  // Helper to show admin menu
  async function showAdminMenu(chatId) {
    const options = {
      reply_markup: {
        keyboard: [
          [{ text: 'View Statistics' }],
          [{ text: 'Broadcast Message' }],
          [{ text: 'Manage Scheduled Messages' }],
          [{ text: 'Change Welcome Message' }],
          [{ text: 'Back to Bot' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    };

    bot.sendMessage(chatId, 'Admin Panel', options);
  }

  // Listen for button presses from the custom keyboard
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (!(await db.isAdmin(chatId))) return;

    // We check the text to navigate the admin menu
    const text = msg.text;

    switch (text) {
      case 'View Statistics':
        {
          const userCount = await db.countUsers();
          bot.sendMessage(chatId, `Total registered users: ${userCount}`);
        }
        break;

      case 'Broadcast Message':
        {
          // Transition to a broadcast flow
          bot.sendMessage(chatId, 'Please use /broadcast to send a message.');
        }
        break;

      case 'Manage Scheduled Messages':
        {
          // Transition to scheduled messages flow
          bot.sendMessage(chatId, 'Please use /schedule to add a new scheduled message.');
        }
        break;

      case 'Change Welcome Message':
        {
          bot.sendMessage(chatId, 'Use /setwelcome <your_new_message> to change the welcome message.');
        }
        break;

      case 'Back to Bot':
        {
          bot.sendMessage(chatId, 'Returning to bot interface...', {
            reply_markup: { remove_keyboard: true }
          });
        }
        break;

      default:
        // Do nothing or handle other flows
        break;
    }
  });
};
