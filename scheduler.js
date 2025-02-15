// scheduler.js
const nodeCron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const db = require('./db');
const { logInfo, logError, rateLimitedSend } = require('./utils');

(async () => {
  try {
    // Create separate bot instance for scheduler
    const bot = new TelegramBot(config.BOT_TOKEN, { polling: false });

    // Cron job: run every 24 hours
    // You can configure the exact time with cron syntax; here it runs at 00:00 every day
    nodeCron.schedule('0 0 * * *', async () => {
      try {
        logInfo('Running daily scheduled messages job...');
        await sendScheduledMessages(bot);
      } catch (err) {
        logError(err);
      }
    });

    logInfo('Scheduler is running...');
  } catch (err) {
    logError(err);
  }
})();

/**
 * Fetch scheduled messages and send them to all users
 */
async function sendScheduledMessages(bot) {
  const messages = await db.getScheduledMessages();
  const result = await db.pool.query('SELECT user_id FROM users');
  const userIds = result.rows.map(row => row.user_id);

  for (const msgRow of messages) {
    const { id, message, media_type, media_url } = msgRow;

    // Define a function to send each message
    const sendFunc = async (userId) => {
      if (!media_type) {
        // Text-only message
        return bot.sendMessage(userId, message);
      }

      switch (media_type) {
        case 'photo':
          return bot.sendPhoto(userId, media_url, { caption: message });
        case 'document':
          return bot.sendDocument(userId, media_url, { caption: message });
        case 'video':
          return bot.sendVideo(userId, media_url, { caption: message });
        case 'voice':
          return bot.sendVoice(userId, media_url, { caption: message });
        case 'sticker':
          return bot.sendSticker(userId, media_url);
        default:
          return bot.sendMessage(userId, message);
      }
    };

    // Send the message to all users, respecting rate limit
    const { successes, failures } = await rateLimitedSend(bot, userIds, sendFunc, 5, 1000);
    logInfo(`Scheduled message [ID: ${id}] sent. Successes: ${successes}, Failures: ${failures}`);

    // Delete the message from the database after sending
    await db.deleteScheduledMessage(id);
  }
}
