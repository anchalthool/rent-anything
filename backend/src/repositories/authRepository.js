const pool = require("../db/db");

async function createUser(name, email, passwordHash) {
  return pool.query(
    `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
    [name, email, passwordHash]
  );
}

async function findUserByEmail(email) {
  return pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
}

module.exports = { createUser, findUserByEmail };
