const pool = require("../db/db");

async function findById(userId) {
  return pool.query(
    `SELECT id, name, email
       FROM users
       WHERE id = $1`,
    [userId]
  );
}

async function updateName(name, userId) {
  return pool.query(
    `UPDATE users
       SET name = $1
       WHERE id = $2
       RETURNING id, name, email`,
    [name, userId]
  );
}

module.exports = { findById, updateName };
