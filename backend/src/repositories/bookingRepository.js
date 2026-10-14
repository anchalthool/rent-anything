const pool = require("../db/db");

async function connect() { return pool.connect(); }
async function begin(client) { return client.query("BEGIN"); }
async function commit(client) { return client.query("COMMIT"); }
async function rollback(client) { return client.query("ROLLBACK"); }

async function findListingForUpdate(client, listingId) {
  return client.query(
    `SELECT *
       FROM listings
       WHERE id = $1
       FOR UPDATE`,
    [listingId]
  );
}

async function findOverlapping(client, listingId, endDate, startDate) {
  return client.query(
    `SELECT *
       FROM bookings
       WHERE listing_id = $1
       AND status IN ('pending', 'approved')
       AND start_date <= $2
       AND end_date >= $3`,
    [listingId, endDate, startDate]
  );
}

async function create(client, listingId, renterId, startDate, endDate, dailyPrice) {
  return client.query(
    `INSERT INTO bookings
       (
         listing_id,
         renter_id,
         start_date,
         end_date,
         daily_price_at_booking
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
    [listingId, renterId, startDate, endDate, dailyPrice]
  );
}

async function findReceived(ownerId) {
  return pool.query(
    `SELECT
        bookings.id,
        bookings.start_date,
        bookings.end_date,
        bookings.status,
        listings.id AS listing_id,
        listings.title,
        users.id AS renter_id,
        users.name AS renter_name
       FROM bookings

       JOIN listings
       ON bookings.listing_id = listings.id

       JOIN users
       ON bookings.renter_id = users.id

       WHERE listings.owner_id = $1

       ORDER BY bookings.start_date`,
    [ownerId]
  );
}

async function updateStatus(status, bookingId, ownerId) {
  return pool.query(
    `UPDATE bookings
       SET status = $1
       FROM listings
       WHERE bookings.id = $2
       AND bookings.listing_id = listings.id
       AND listings.owner_id = $3
       RETURNING bookings.*`,
    [status, bookingId, ownerId]
  );
}

async function cancel(bookingId, renterId) {
  return pool.query(
    `UPDATE bookings
       SET status = 'cancelled'
       WHERE id = $1
       AND renter_id = $2
       AND status IN ('pending', 'approved')
       RETURNING *`,
    [bookingId, renterId]
  );
}

async function complete(bookingId, ownerId) {
  return pool.query(
    `UPDATE bookings
       SET status = 'completed'
       FROM listings
       WHERE bookings.id = $1
       AND bookings.listing_id = listings.id
       AND listings.owner_id = $2
       AND bookings.status = 'approved'
       RETURNING bookings.*`,
    [bookingId, ownerId]
  );
}

async function findCheckout(bookingId, renterId) {
  return pool.query(
    `SELECT
        bookings.id,
        bookings.start_date,
        bookings.end_date,
        bookings.daily_price_at_booking,
        listings.title

       FROM bookings

       JOIN listings
       ON bookings.listing_id = listings.id

       WHERE bookings.id = $1
       AND bookings.renter_id = $2
       AND bookings.status = 'approved'`,
    [bookingId, renterId]
  );
}

async function pay(bookingId, renterId) {
  return pool.query(
    `UPDATE bookings
       SET payment_status = 'paid'
       WHERE id = $1
       AND renter_id = $2
       AND status = 'approved'
       AND payment_status = 'unpaid'
       RETURNING *`,
    [bookingId, renterId]
  );
}

async function findByRenterId(renterId) {
  return pool.query(
    `SELECT
        bookings.id,
        bookings.start_date,
        bookings.end_date,
        bookings.status,
        bookings.payment_status,
        bookings.daily_price_at_booking,
        listings.id AS listing_id,
        listings.title,
        listings.city
       FROM bookings
       JOIN listings
         ON bookings.listing_id = listings.id
       WHERE bookings.renter_id = $1
       ORDER BY bookings.start_date DESC`,
    [renterId]
  );
}

module.exports = { connect, begin, commit, rollback, findListingForUpdate, findOverlapping, create, findReceived, updateStatus, cancel, complete, findCheckout, pay, findByRenterId };
