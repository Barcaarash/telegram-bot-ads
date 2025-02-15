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
