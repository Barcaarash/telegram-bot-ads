// utils.js
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
    // Optionally add a file transport:
    // new winston.transports.File({ filename: 'bot.log' })
  ]
});

/**
 * Simple helper for logging errors
 */
function logError(error) {
  logger.error(error);
}

/**
 * Simple helper for logging info messages
 */
function logInfo(message) {
  logger.info(message);
}

/**
 * Helper to enforce rate limits by sending messages in batches.
 * Telegram limit: 300 messages per minute (~5 messages/second).
 */
function rateLimitedSend(bot, chatIds, sendFunc, batchSize = 5, delayMs = 1000) {
  return new Promise((resolve) => {
    let currentIndex = 0;
    let successes = 0;
    let failures = 0;

    function sendBatch() {
      const batch = chatIds.slice(currentIndex, currentIndex + batchSize);
      Promise.all(
        batch.map(chatId => {
          return sendFunc(chatId).then(() => {
            successes++;
          }).catch(() => {
            failures++;
          });
        })
      ).then(() => {
        currentIndex += batchSize;

        // Update progress
        const progress = Math.floor((currentIndex / chatIds.length) * 100);
        logInfo(`Broadcast progress: ${progress}%`);

        if (currentIndex < chatIds.length) {
          setTimeout(sendBatch, delayMs);
        } else {
          resolve({ successes, failures });
        }
      });
    }

    sendBatch();
  });
}

module.exports = {
  logger,
  logError,
  logInfo,
  rateLimitedSend
};
