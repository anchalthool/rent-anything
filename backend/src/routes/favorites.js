const express = require("express");
const router = express.Router();

const pool = require("../db/db");
const authenticate = require("../middleware/auth");

router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
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
      [req.userId]
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

  try {
    const result = await pool.query(
      `INSERT INTO favorites (user_id, listing_id)
       VALUES ($1, $2)
       RETURNING *`,
      [req.userId, listingId]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
  if (error.code === "23505") {
    return res.status(409).json({
      message: "Listing already favorited"
    });
  }

  console.log(error);

  res.status(500).json({
    message: "Something went wrong"
  });
}
});

router.delete("/:listingId", authenticate, async (req, res) => {
  const listingId = Number(req.params.listingId);

  try {
    const result = await pool.query(
      `DELETE FROM favorites
       WHERE user_id = $1
       AND listing_id = $2
       RETURNING *`,
      [req.userId, listingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Favorite not found"
      });
    }

    res.json({
      message: "Favorite removed"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
});

module.exports = router;