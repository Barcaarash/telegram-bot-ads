// handlers/broadcast.js
const db = require('../db');
const { rateLimitedSend, logInfo, logError } = require('../utils');

module.exports = function broadcastHandler(bot) {
  // Command to initiate a broadcast
  bot.onText(/\/broadcast/, async (msg) => {
    const chatId = msg.chat.id;
    if (!(await db.isAdmin(chatId))) {
      return bot.sendMessage(chatId, 'Access denied. You are not an admin.');
    }

    // Ask admin what message they want to broadcast
    bot.sendMessage(chatId, 'Please send me the message or media you want to broadcast.', {
      reply_markup: {
        keyboard: [[{ text: 'Cancel Broadcast' }]],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });

    // We'll listen for the next message to take as broadcast content
    bot.once('message', async (answerMsg) => {
      if (answerMsg.text === 'Cancel Broadcast') {
        bot.sendMessage(chatId, 'Broadcast canceled.', {
          reply_markup: { remove_keyboard: true }
        });
        return;
      }

      const broadcastContent = answerMsg;

      // Confirm broadcast
      const confirmOptions = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Confirm', callback_data: 'confirm_broadcast' }],
            [{ text: '❌ Cancel', callback_data: 'cancel_broadcast' }]
          ]
        }
      };
      bot.sendMessage(chatId, 'Do you want to send this broadcast to all users?', confirmOptions);

      // Wait for admin's decision
      bot.once('callback_query', async (callbackQuery) => {
        const data = callbackQuery.data;
        if (data === 'confirm_broadcast') {
          bot.sendMessage(chatId, 'Starting broadcast...', { reply_markup: { remove_keyboard: true } });
          await startBroadcast(broadcastContent);
        } else {
          bot.sendMessage(chatId, 'Broadcast canceled.', { reply_markup: { remove_keyboard: true } });
        }
      });
    });

    async function startBroadcast(content) {
      try {
        // Get all users
        const result = await db.pool.query('SELECT user_id FROM users');
        const userIds = result.rows.map(row => row.user_id);

        // Broadcasting function
        const sendFunc = async (userId) => {
          // Check if there's media or text
          if (content.photo) {
            // Photo
            const fileId = content.photo[content.photo.length - 1].file_id;
            return bot.sendPhoto(userId, fileId, { caption: content.caption || '' });
          } else if (content.document) {
            return bot.sendDocument(userId, content.document.file_id, { caption: content.caption || '' });
          } else if (content.video) {
            return bot.sendVideo(userId, content.video.file_id, { caption: content.caption || '' });
          } else if (content.voice) {
            return bot.sendVoice(userId, content.voice.file_id, { caption: content.caption || '' });
          } else if (content.sticker) {
            return bot.sendSticker(userId, content.sticker.file_id);
          } else {
            // Text only
            return bot.sendMessage(userId, content.text);
          }
        };

        // Use rate-limited send
        const { successes, failures } = await rateLimitedSend(bot, userIds, sendFunc, 5, 1000); 
        // 5 messages/sec => 300 messages/min

        bot.sendMessage(chatId, `Broadcast completed. Successes: ${successes}, Failures: ${failures}`);
        if (failures > 0) {
          bot.sendMessage(chatId, 'Some messages failed. Use /retry to send to failed users.');
        }
      } catch (err) {
        logError(err);
        bot.sendMessage(chatId, 'Error during broadcast.');
      }
    }
  });

  // Potential /retry command to handle re-sending to failed users:
  // (You could store failed user IDs in memory or DB, then re-send.)
  // This is a simplified placeholder implementation.
  bot.onText(/\/retry/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Retry logic to be implemented.');
  });
};
