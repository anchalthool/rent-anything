const bookingRepository = require("../repositories/bookingRepository");

function fail(statusCode, message) {
  throw Object.assign(new Error(message), { statusCode });
}

async function createBooking(listingId, renterId, startDate, endDate) {
  const client = await bookingRepository.connect();
  try {
    await bookingRepository.begin(client);
    const listingResult = await bookingRepository.findListingForUpdate(client, listingId);
    const listing = listingResult.rows[0];
    if (!listing) fail(404, "Listing not found");
    if (listing.owner_id === renterId) fail(400, "You cannot rent your own listing");
    const overlaps = await bookingRepository.findOverlapping(client, listingId, endDate, startDate);
    if (overlaps.rows.length > 0) fail(400, "Listing is already booked for these dates");
    const result = await bookingRepository.create(client, listingId, renterId, startDate, endDate, listing.daily_price);
    await bookingRepository.commit(client);
    return result.rows[0];
  } catch (error) {
    await bookingRepository.rollback(client);
    throw error;
  } finally {
    client.release();
  }
}

async function findReceived(ownerId) {
  return bookingRepository.findReceived(ownerId);
}

async function updateStatus(status, bookingId, ownerId) {
  return bookingRepository.updateStatus(status, bookingId, ownerId);
}

async function cancel(bookingId, renterId) {
  return bookingRepository.cancel(bookingId, renterId);
}

async function complete(bookingId, ownerId) {
  return bookingRepository.complete(bookingId, ownerId);
}

async function getCheckout(bookingId, renterId) {
  const result = await bookingRepository.findCheckout(bookingId, renterId);
  const booking = result.rows[0];
  if (!booking) return null;
  const rentalDays = (new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24);
  const dailyPrice = Number(booking.daily_price_at_booking);
  return {
    bookingId: booking.id,
    title: booking.title,
    rentalDays,
    dailyPrice,
    totalPrice: rentalDays * dailyPrice,
  };
}

async function pay(bookingId, renterId) {
  return bookingRepository.pay(bookingId, renterId);
}

async function findByRenterId(renterId) {
  return bookingRepository.findByRenterId(renterId);
}

module.exports = { createBooking, findReceived, updateStatus, cancel, complete, getCheckout, pay, findByRenterId };
