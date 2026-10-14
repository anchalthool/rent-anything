const pool = require("../db/db");

async function findBookingById(bookingId) {
  return pool.query(
    "SELECT * FROM bookings WHERE id = $1",
    [bookingId]
  );
}

async function findByBookingId(bookingId) {
  return pool.query(
    "SELECT * FROM payments WHERE booking_id = $1",
    [bookingId]
  );
}

async function create(bookingId, idempotencyKey, amount) {
  return pool.query(
    `INSERT INTO payments
       (booking_id, idempotency_key, amount, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
    [bookingId, idempotencyKey, amount]
  );
}

module.exports = { findBookingById, findByBookingId, create };
