require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "rentanything",
  port: Number(process.env.PGPORT || 5432),
  password: process.env.PGPASSWORD
});

module.exports = pool;