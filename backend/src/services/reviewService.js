const reviewRepository = require("../repositories/reviewRepository");

async function findByListingId(listingId) {
  return reviewRepository.findByListingId(listingId);
}

async function create(listingId, userId, rating, comment) {
  const booking = await reviewRepository.findEligibleBooking(listingId, userId);
  if (booking.rows.length === 0) return null;
  return reviewRepository.create(listingId, userId, rating, comment || null);
}

module.exports = { findByListingId, create };
