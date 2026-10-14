const pool = require("../db/db");

async function findAll() {
  return pool.query(
    "SELECT * FROM categories ORDER BY id"
  );
}

module.exports = { findAll };
