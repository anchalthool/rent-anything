const paymentRepository = require("../repositories/paymentRepository");
const paymentQueue = require("../queues/paymentQueue");

function fail(statusCode, message) {
  throw Object.assign(new Error(message), { statusCode });
}

async function createPayment(bookingId, renterId) {
  const bookingResult = await paymentRepository.findBookingById(bookingId);
  const booking = bookingResult.rows[0];
  if (!booking) fail(404, "Booking not found");
  if (booking.renter_id !== renterId) fail(403, "You cannot pay for this booking");
  if (booking.status !== "approved") fail(400, "Only approved bookings can be paid");

  const existingPayment = await paymentRepository.findByBookingId(bookingId);
  if (existingPayment.rows.length > 0) {
    return { payment: existingPayment.rows[0], created: false };
  }

  const rentalDays = (new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24);
  const amount = rentalDays * Number(booking.daily_price_at_booking);
  const idempotencyKey = `booking:${bookingId}:payment`;
  const result = await paymentRepository.create(bookingId, idempotencyKey, amount);
  const payment = result.rows[0];
  await paymentQueue.add("process-payment", { paymentId: payment.id, amount });
  return { payment, created: true };
}

module.exports = { createPayment };
