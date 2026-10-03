const express = require("express");
const router = express.Router();

const paymentQueue = require("../queues/paymentQueue");
const authenticate = require("../middleware/auth");
const pool = require("../db/db");

router.post("/:bookingId", authenticate, async (req, res) => {
  try {
    // 1. Get booking
    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [req.params.bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

    // 2. Check booking belongs to logged-in renter
    if (booking.renter_id !== req.userId) {
      return res.status(403).json({
        message: "You cannot pay for this booking",
      });
    }

    // 3. Only approved bookings can be paid
    if (booking.status !== "approved") {
      return res.status(400).json({
        message: "Only approved bookings can be paid",
      });
    }

    // 4. If payment already exists, return it
    const existingPayment = await pool.query(
      "SELECT * FROM payments WHERE booking_id = $1",
      [req.params.bookingId]
    );

    if (existingPayment.rows.length > 0) {
      return res.status(200).json(existingPayment.rows[0]);
    }

    // 5. Calculate payment amount on backend
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);

    const rentalDays =
      (end - start) / (1000 * 60 * 60 * 24);

    const amount =
      rentalDays * Number(booking.daily_price_at_booking);

    // 6. Server-generated idempotency key
    const idempotencyKey =
      `booking:${req.params.bookingId}:payment`;

    // 7. Create payment as pending
    const newPayment = await pool.query(
      `INSERT INTO payments
       (booking_id, idempotency_key, amount, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [
        req.params.bookingId,
        idempotencyKey,
        amount,
      ]
    );

    // 8. Send payment work to Redis queue
    await paymentQueue.add("process-payment", {
      paymentId: newPayment.rows[0].id,
      amount: amount,
    });

    // 9. Payment is accepted for processing
    return res.status(202).json(newPayment.rows[0]);

  } catch (err) {
    console.error(err);

    // Duplicate payment / idempotency protection
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Payment already exists",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

module.exports = router;