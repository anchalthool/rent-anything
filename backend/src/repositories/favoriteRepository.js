const pool = require("../db/db");

async function findByUserId(userId) {
  return pool.query(
    `SELECT
        listings.id,
        listings.title,
        listings.daily_price,
        listings.city,
        categories.name AS category
       FROM favorites

       JOIN listings
       ON favorites.listing_id = listings.id

       JOIN categories
       ON listings.category_id = categories.id

       WHERE favorites.user_id = $1

       ORDER BY listings.id DESC`,
    [userId]
  );
}

async function create(userId, listingId) {
  return pool.query(
    `INSERT INTO favorites (user_id, listing_id)
       VALUES ($1, $2)
       RETURNING *`,
    [userId, listingId]
  );
}

async function remove(userId, listingId) {
  return pool.query(
    `DELETE FROM favorites
       WHERE user_id = $1
       AND listing_id = $2
       RETURNING *`,
    [userId, listingId]
  );
}

module.exports = { findByUserId, create, remove };
