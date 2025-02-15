// db.js
const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool(config.DB);

/**
 * Initialize database tables if they don't exist.
 * Make sure your schema matches the specification you gave.
 */
async function initTables() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id BIGINT PRIMARY KEY,
      join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      start_count INT DEFAULT 1
    );
  `;

  const createAdminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
      admin_id BIGINT PRIMARY KEY
    );
  `;

  const createScheduledMessagesTable = `
    CREATE TABLE IF NOT EXISTS scheduled_messages (
      id SERIAL PRIMARY KEY,
      message TEXT,
      media_type TEXT,
      media_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(createUsersTable);
  await pool.query(createAdminsTable);
  await pool.query(createScheduledMessagesTable);
}

/**
 * Checks if user is in the users table
 */
async function isUserExists(userId) {
  const res = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
  return res.rowCount > 0;
}

/**
 * Insert or update user
 */
async function upsertUser(userId) {
  if (await isUserExists(userId)) {
    // Increment start_count
    await pool.query(
      'UPDATE users SET start_count = start_count + 1 WHERE user_id = $1',
      [userId]
    );
  } else {
    await pool.query(
      'INSERT INTO users (user_id) VALUES ($1)',
      [userId]
    );
  }
}

/**
 * Remove user if they block the bot
 */
async function removeUser(userId) {
  await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
}

/**
 * Count total users
 */
async function countUsers() {
  const res = await pool.query('SELECT COUNT(*) FROM users');
  return parseInt(res.rows[0].count, 10);
}

/**
 * Check if user is admin
 */
async function isAdmin(adminId) {
  const res = await pool.query('SELECT * FROM admins WHERE admin_id = $1', [adminId]);
  return res.rowCount > 0;
}

/**
 * Add new admin
 */
async function addAdmin(adminId) {
  await pool.query('INSERT INTO admins (admin_id) VALUES ($1) ON CONFLICT DO NOTHING', [adminId]);
}

/**
 * Remove admin
 */
async function removeAdmin(adminId) {
  await pool.query('DELETE FROM admins WHERE admin_id = $1', [adminId]);
}

/**
 * Retrieve all admins
 */
async function getAllAdmins() {
  const res = await pool.query('SELECT admin_id FROM admins');
  return res.rows.map(row => row.admin_id);
}

/**
 * CRUD for scheduled messages
 */
async function addScheduledMessage(message, mediaType, mediaUrl) {
  await pool.query(
    `INSERT INTO scheduled_messages (message, media_type, media_url) 
     VALUES ($1, $2, $3)`,
    [message, mediaType, mediaUrl]
  );
}

/**
 * Get all scheduled messages
 */
async function getScheduledMessages() {
  const res = await pool.query('SELECT * FROM scheduled_messages ORDER BY id ASC');
  return res.rows;
}

/**
 * Delete scheduled message by ID
 */
async function deleteScheduledMessage(id) {
  await pool.query('DELETE FROM scheduled_messages WHERE id = $1', [id]);
}

module.exports = {
  pool,
  initTables,
  upsertUser,
  removeUser,
  countUsers,
  isAdmin,
  addAdmin,
  removeAdmin,
  getAllAdmins,
  addScheduledMessage,
  getScheduledMessages,
  deleteScheduledMessage
};
