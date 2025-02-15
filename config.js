// config.js
module.exports = {
  BOT_TOKEN: 'YOUR_TELEGRAM_BOT_TOKEN',       // Replace with your actual Telegram bot token
  MAIN_ADMIN_ID: 123456789,                  // Replace with the Telegram ID of the main admin
  DB: {
    user: 'postgres',                        // PostgreSQL user
    host: 'localhost',                       // PostgreSQL host
    database: 'telegram_bot',                // PostgreSQL database name
    password: 'postgres',                    // PostgreSQL password
    port: 5432,                              // PostgreSQL port
  },
  WELCOME_MESSAGE: 'Welcome to our Bot!',    // Default welcome message (can be changed via admin panel)
  RATE_LIMIT: {
    MESSAGES_PER_MINUTE: 300,                // Telegram rate limit
  }
};
