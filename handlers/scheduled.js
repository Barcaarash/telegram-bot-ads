// handlers/scheduled.js
const db = require('../db');
const { logError } = require('../utils');

module.exports = function scheduledHandler(bot) {
  // Command to add a scheduled message
  bot.onText(/\/schedule/, async (msg) => {
    const chatId = msg.chat.id;
    if (!(await db.isAdmin(chatId))) {
      return bot.sendMessage(chatId, 'Access denied. You are not an admin.');
    }

    bot.sendMessage(chatId, 'Please send the message or media to schedule. (Reply with "cancel" to exit)');
    
    bot.once('message', async (scheduledMsg) => {
      if (scheduledMsg.text && scheduledMsg.text.toLowerCase() === 'cancel') {
        return bot.sendMessage(chatId, 'Operation canceled.');
      }

      // Add scheduled message to DB
      // Simple logic: text or recognized media
      let mediaType = null;
      let mediaUrl = null;

      if (scheduledMsg.photo) {
        mediaType = 'photo';
        mediaUrl = scheduledMsg.photo[scheduledMsg.photo.length - 1].file_id;
      } else if (scheduledMsg.document) {
        mediaType = 'document';
        mediaUrl = scheduledMsg.document.file_id;
      } else if (scheduledMsg.video) {
        mediaType = 'video';
        mediaUrl = scheduledMsg.video.file_id;
      } else if (scheduledMsg.voice) {
        mediaType = 'voice';
        mediaUrl = scheduledMsg.voice.file_id;
      } else if (scheduledMsg.sticker) {
        mediaType = 'sticker';
        mediaUrl = scheduledMsg.sticker.file_id;
      }
      
      const messageText = scheduledMsg.caption || scheduledMsg.text || '';

      try {
        // Enforce max 10 scheduled messages
        let scheduledMessages = await db.getScheduledMessages();
        if (scheduledMessages.length >= 10) {
          // Delete the oldest
          const oldestId = scheduledMessages[0].id;
          await db.deleteScheduledMessage(oldestId);
        }

        await db.addScheduledMessage(messageText, mediaType, mediaUrl);
        bot.sendMessage(chatId, 'Scheduled message added successfully!');
      } catch (err) {
        logError(err);
        bot.sendMessage(chatId, 'Failed to add scheduled message.');
      }
    });
  });
};
