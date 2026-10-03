const express = require("express");
const router = express.Router();
const redisClient = require("../configs/redisClient");
const pool = require("../db/db");
const authenticate = require("../middleware/auth");
const optionalAuthenticate = require("../middleware/optionalAuthenticate");

// GET ALL
router.get("/", optionalAuthenticate, async (req, res) => {
  try {
    const city = req.query.city;
    const category = req.query.category;
    const maxPrice = req.query.maxPrice;
    const search = req.query.search;
    const sort = req.query.sort;

    // Pagination
    const page = Math.max(Number(req.query.page) || 1, 1);
    const requestedLimit = Number(req.query.limit) || 10;
    const limit = Math.min(Math.max(requestedLimit, 1), 50);

    const offset = (page - 1) * limit;

    let query = `
      SELECT
        listings.id,
        listings.title,
        listings.daily_price,
        listings.city,
        categories.name AS category,
        users.id AS owner_id,
        users.name AS owner_name
      FROM listings

      JOIN categories
      ON listings.category_id = categories.id

      JOIN users
      ON listings.owner_id = users.id

      WHERE 1 = 1
    `;

    const values = [];

    // Hide logged-in user's own listings
    if (req.userId) {
      values.push(req.userId);

      query += `
        AND listings.owner_id != $${values.length}
      `;
    }

    // City filter
    if (city) {
      values.push(city.trim());

      query += `
        AND LOWER(listings.city) = LOWER($${values.length})
      `;
    }

    // Category filter
    if (category) {
      values.push(category.trim());

      query += `
        AND LOWER(categories.name) = LOWER($${values.length})
      `;
    }

    // Maximum price filter
    if (maxPrice) {
      const priceLimit = Number(maxPrice);

      if (!Number.isFinite(priceLimit) || priceLimit <= 0) {
        return res.status(400).json({
          message: "Maximum price must be greater than zero",
        });
      }

      values.push(priceLimit);

      query += `
        AND listings.daily_price <= $${values.length}
      `;
    }

    // Search
    if (search) {
      values.push(`%${search.trim()}%`);

      query += `
        AND listings.title ILIKE $${values.length}
      `;
    }

    // Sorting comes AFTER all filters
    if (sort === "price_asc") {
      query += ` ORDER BY listings.daily_price ASC`;
    } else if (sort === "price_desc") {
      query += ` ORDER BY listings.daily_price DESC`;
    } else {
      query += ` ORDER BY listings.id DESC`;
    }

    // Pagination
    values.push(limit);
    query += ` LIMIT $${values.length}`;

    values.push(offset);
    query += ` OFFSET $${values.length}`;

    const dbResult = await pool.query(query, values);

    res.json(dbResult.rows);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});


router.get("/mine", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        listings.id,
        listings.title,
        listings.daily_price,
        listings.city,
        categories.name AS category
       FROM listings
       JOIN categories
       ON listings.category_id = categories.id
       WHERE listings.owner_id = $1`,
      [req.userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.get("/:id/availability", async (req, res) => {
  const listingId = Number(req.params.id);

  try {
    const result = await pool.query(
      `SELECT start_date, end_date
       FROM bookings
       WHERE listing_id = $1
       AND status IN ('pending', 'approved')
       ORDER BY start_date`,
      [listingId],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.get("/:id/stats", authenticate, async (req, res) => {
  const listingId = Number(req.params.id);

  try {
    const result = await pool.query(
      `SELECT
        COUNT(bookings.id) AS total_bookings,

        COUNT(bookings.id) FILTER (
          WHERE bookings.status = 'completed'
        ) AS completed_bookings,

        COALESCE(ROUND(AVG(reviews.rating), 1), 0) AS average_rating

       FROM listings

       LEFT JOIN bookings
       ON bookings.listing_id = listings.id

       LEFT JOIN reviews
       ON reviews.listing_id = listings.id

       WHERE listings.id = $1
       AND listings.owner_id = $2

       GROUP BY listings.id`,
      [listingId, req.userId],
    );

    const stats = result.rows[0];

    if (!stats) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.json(stats);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

//GET BY ID
router.get("/:id", async (req, res) => {
  const listingId = Number(req.params.id);
  const cachedListing = await redisClient.get(`listing:${req.params.id}`);
  console.log("cachedListing:", cachedListing);
  if (cachedListing) {
    return res.json(JSON.parse(cachedListing));
  }

  try {
    const result = await pool.query("SELECT * FROM listings WHERE id = $1", [
      listingId,
    ]);

    const listing = result.rows[0];

    await redisClient.set(`listing:${req.params.id}`, JSON.stringify(listing),{EX:60});

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.json(listing);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

//POST
router.post("/", authenticate, async (req, res) => {
  // Validate title
  if (typeof req.body?.title !== "string" || req.body.title.trim() === "") {
    return res.status(400).json({
      message: "Title must be a non-empty string",
    });
  }

  // Validate daily price
  if (typeof req.body.dailyPrice !== "number" || req.body.dailyPrice <= 0) {
    return res.status(400).json({
      message: "Daily price must be a number greater than zero",
    });
  }

  // Validate category
  if (typeof req.body.categoryId !== "number" || req.body.categoryId <= 0) {
    return res.status(400).json({
      message: "Category ID must be a valid number",
    });
  }

  // Validate city
  if (typeof req.body.city !== "string" || req.body.city.trim() === "") {
    return res.status(400).json({
      message: "City must be a non-empty string",
    });
  }

  // Clean the data
  const title = req.body.title.trim();
  const categoryId = req.body.categoryId;
  const dailyPrice = req.body.dailyPrice;
  const city = req.body.city.trim();
  const ownerId = req.userId;

  try {
    // Save listing in PostgreSQL
    const result = await pool.query(
      `INSERT INTO listings
   (title, category_id, daily_price, city, owner_id)
   
   VALUES ($1, $2, $3, $4, $5)
   
   RETURNING *`,

      [title, categoryId, dailyPrice, city, ownerId],
    );

    // Get newly created listing
    const newListing = result.rows[0];

    // Send it back
    res.status(201).json(newListing);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// UPDATE PRICE
router.patch("/:id", authenticate, async (req, res) => {
  const listingId = Number(req.params.id);
  const newPrice = req.body?.dailyPrice;

  // Check the new price
  if (typeof newPrice !== "number" || newPrice <= 0) {
    return res.status(400).json({
      message: "Daily price must be a number greater than zero",
    });
  }

  try {
    // Update the price in PostgreSQL
    const result = await pool.query(
      `UPDATE listings
   SET daily_price = $1
   WHERE id = $2
   AND owner_id = $3
   RETURNING *`,
      [newPrice, listingId, req.userId],
    );
    await redisClient.del(`listing:${req.params.id}`);

    // Get the updated listing
    const listing = result.rows[0];

    // Listing doesn't exist
    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    // Send updated listing
    res.json(listing);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// DELETE LISTING
router.delete("/:id", authenticate, async (req, res) => {
  const listingId = Number(req.params.id);

  try {
    // Delete from PostgreSQL
    const result = await pool.query(
      `DELETE FROM listings
   WHERE id = $1 AND owner_id = $2
   RETURNING *`,
      [listingId, req.userId],
    );
    await redisClient.del(`listing:${req.params.id}`);

    // Check if a listing was actually deleted
    const deletedListing = result.rows[0];

    if (!deletedListing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.json({
      message: "Listing deleted",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

module.exports = router;
