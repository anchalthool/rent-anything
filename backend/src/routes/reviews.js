const express = require("express");
const router = express.Router();

const pool = require("../db/db");
const authenticate = require("../middleware/auth");

router.get("/:listingId", async (req, res) => {
  const listingId = Number(req.params.listingId);

  try {
    const result = await pool.query(
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
    res.json(result.rows);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
});

router.post("/:listingId", authenticate, async (req, res) => {
  const listingId = Number(req.params.listingId);
  const rating = Number(req.body.rating);
  const comment = req.body.comment;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Rating must be between 1 and 5",
    });
  }

  try {
    const bookingResult = await pool.query(
      `SELECT id
   FROM bookings
   WHERE listing_id = $1
   AND renter_id = $2
   AND status = 'approved'
   LIMIT 1`,
      [listingId, req.userId],
    );

    if (bookingResult.rows.length === 0) {
      return res.status(403).json({
        message: "You can only review listings you have rented",
      });
    }
    const result = await pool.query(
      `INSERT INTO reviews
       (listing_id, reviewer_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [listingId, req.userId, rating, comment || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "You already reviewed this listing",
      });
    }

    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

module.exports = router;
