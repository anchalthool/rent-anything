require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, "migrations");

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);

      const sql = fs.readFileSync(
        path.join(migrationsDir, file),
        "utf8"
      );

      await pool.query(sql);
    }

    console.log("Migrations complete");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();