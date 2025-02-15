# Telegram Bot with Node.js and PostgreSQL

## Overview
This Telegram bot uses **Node.js**, **PostgreSQL**, and **node-telegram-bot-api** to:
- Register users when they start the bot.
- Send a configurable welcome message.
- Provide an admin panel (only for authorized admins) to:
  - View user statistics
  - Send broadcasts (with media support)
  - Schedule daily messages
  - Configure the welcome message
  - Manage admin privileges

## Features
1. **User Registration**  
   Stores user IDs in the `users` table upon `/start`.

2. **Admin Panel**  
   - **View Stats:** Total user count.  
   - **Send Broadcasts:** Supports text, photos, videos, etc.  
   - **Scheduled Messages:** Send daily automatically (up to 10).  
   - **Welcome Message Config:** Change via command.  
   - **Admin Management:** Main admin can add/remove others.

3. **Scheduled Messages**  
   - Stored in `scheduled_messages` table.  
   - Sent every 24 hours (deleted after sending).  

4. **Rate Limiting**  
   - Respects Telegram's 300 messages/minute limit using a batch approach.

5. **Logging & Error Handling**  
   - Uses **Winston** for structured logs.  
   - Detailed logs for broadcasts and scheduled sends.

## Database Setup

```sql
CREATE DATABASE telegram_bot;
\c telegram_bot;

CREATE TABLE users (
  user_id BIGINT PRIMARY KEY,
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  start_count INT DEFAULT 1
);

CREATE TABLE admins (
  admin_id BIGINT PRIMARY KEY
);

CREATE TABLE scheduled_messages (
  id SERIAL PRIMARY KEY,
  message TEXT,
  media_type TEXT,
  media_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Installation & Usage
Clone the Repository

bash
Copy
Edit
git clone https://github.com/your-repo/telegram_bot.git
cd telegram_bot
Install Dependencies

bash
Copy
Edit
npm install
Configure config.js

Update BOT_TOKEN to your Telegram bot token.
Update PostgreSQL connection details.
Set MAIN_ADMIN_ID to your own Telegram ID.
Initialize Tables (Optional: the script calls initTables() automatically.)

bash
Copy
Edit
node
> const db = require('./db');
> db.initTables();
> .exit
Run the Bot

bash
Copy
Edit
node main.js
Run the Scheduler (in another process/terminal)

bash
Copy
Edit
node scheduler.js
This schedules daily messages using node-cron.

(Optional) Use PM2

bash
Copy
Edit
npm install -g pm2
pm2 start main.js --name telegram-bot
pm2 start scheduler.js --name message-scheduler
pm2 save
pm2 startup
Notes
The bot’s commands:
/start — Register or update user.
/admin — Access admin panel (for admins only).
/stats — View statistics (admin only).
/broadcast — Broadcast messages (admin only).
/schedule — Schedule daily messages (admin only).
/setwelcome <text> — Change welcome message (admin only).
/addadmin <id>, /removeadmin <id> — Manage admins (main admin only).
Make sure your bot token is valid and that PostgreSQL is running.
Customize inline keyboards or menus as needed.
