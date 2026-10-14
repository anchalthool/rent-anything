const pool = require("../db/db");

async function findByListingId(listingId) {
  return pool.query(
    `SELECT
    listings.id,
    listings.title,
    listings.daily_price,
    listings.city,
    categories.name AS category,
    users.id AS owner_id,
    users.name AS owner_name,

    COALESCE(ROUND(AVG(reviews.rating), 1), 0) AS average_rating

   FROM listings

   JOIN categories
   ON listings.category_id = categories.id

   JOIN users
   ON listings.owner_id = users.id

   LEFT JOIN reviews
   ON reviews.listing_id = listings.id

   WHERE listings.id = $1

   GROUP BY
    listings.id,
    categories.name,
    users.id,
    users.name`,
    [listingId]
  );
}

async function findEligibleBooking(listingId, userId) {
  return pool.query(
    `SELECT id
   FROM bookings
   WHERE listing_id = $1
   AND renter_id = $2
   AND status = 'approved'
   LIMIT 1`,
    [listingId, userId]
  );
}

async function create(listingId, userId, rating, comment) {
  return pool.query(
    `INSERT INTO reviews
       (listing_id, reviewer_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
    [listingId, userId, rating, comment]
  );
}

module.exports = { findByListingId, findEligibleBooking, create };
