const express = require("express");
const router = express.Router();

const pool = require("../db/db");
const authenticate = require("../middleware/auth");

router.post("/", authenticate, async (req, res) => {
  const listingId = req.body.listingId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  if (!listingId || !startDate || !endDate) {
    return res.status(400).json({
      message: "Listing, start date and end date are required",
    });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({
      message: "End date must be after start date",
    });
  }

  // Get one dedicated connection for this transaction
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const listingResult = await client.query(
      `SELECT *
       FROM listings
       WHERE id = $1
       FOR UPDATE`,
      [listingId],
    );

    const listing = listingResult.rows[0];

    if (!listing) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (listing.owner_id === req.userId) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "You cannot rent your own listing",
      });
    }

    const overlapResult = await client.query(
      `SELECT *
       FROM bookings
       WHERE listing_id = $1
       AND status IN ('pending', 'approved')
       AND start_date <= $2
       AND end_date >= $3`,
      [listingId, endDate, startDate],
    );

    if (overlapResult.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Listing is already booked for these dates",
      });
    }

    const result = await client.query(
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
      [
        listingId,
        req.userId,
        startDate,
        endDate,
        listing.daily_price,
      ],
    );

    await client.query("COMMIT");

    res.status(201).json(result.rows[0]);

  } catch (error) {
    await client.query("ROLLBACK");

    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });

  } finally {
    client.release();
  }
});


router.get("/received", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
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



router.patch("/:id/status", authenticate, async (req, res) => {
  const bookingId = Number(req.params.id);
  const status = req.body.status;

  if (status !== "approved" && status !== "rejected") {
    return res.status(400).json({
      message: "Status must be approved or rejected",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE bookings
       SET status = $1
       FROM listings
       WHERE bookings.id = $2
       AND bookings.listing_id = listings.id
       AND listings.owner_id = $3
       RETURNING bookings.*`,
      [status, bookingId, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.patch("/:id/cancel", authenticate, async (req, res) => {
  const bookingId = Number(req.params.id);

  try {
    const result = await pool.query(
      `UPDATE bookings
       SET status = 'cancelled'
       WHERE id = $1
       AND renter_id = $2
       AND status IN ('pending', 'approved')
       RETURNING *`,
      [bookingId, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking cannot be cancelled",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});


router.patch("/:id/complete", authenticate, async (req, res) => {
  const bookingId = Number(req.params.id);

  try {
    const result = await pool.query(
      `UPDATE bookings
       SET status = 'completed'
       FROM listings
       WHERE bookings.id = $1
       AND bookings.listing_id = listings.id
       AND listings.owner_id = $2
       AND bookings.status = 'approved'
       RETURNING bookings.*`,
      [bookingId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking cannot be completed"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
});

router.get("/:id/checkout", authenticate, async (req, res) => {
  const bookingId = Number(req.params.id);

  try {
    const result = await pool.query(
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
      [bookingId, req.userId]
    );

    const booking = result.rows[0];

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or not ready for checkout"
      });
    }

    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const rentalDays =
      (endDate - startDate) / millisecondsPerDay;

    const totalPrice =
      rentalDays * Number(booking.daily_price_at_booking);

    res.json({
      bookingId: booking.id,
      title: booking.title,
      rentalDays: rentalDays,
      dailyPrice: Number(booking.daily_price_at_booking),
      totalPrice: totalPrice
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
});

router.patch("/:id/pay", authenticate, async (req, res) => {
  const bookingId = Number(req.params.id);

  try {
    const result = await pool.query(
      `UPDATE bookings
       SET payment_status = 'paid'
       WHERE id = $1
       AND renter_id = $2
       AND status = 'approved'
       AND payment_status = 'unpaid'
       RETURNING *`,
      [bookingId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Booking cannot be paid"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
});

router.get("/mine", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
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

module.exports = router;
