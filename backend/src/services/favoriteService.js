const favoriteRepository = require("../repositories/favoriteRepository");

async function findByUserId(userId) {
  return favoriteRepository.findByUserId(userId);
}

async function create(userId, listingId) {
  return favoriteRepository.create(userId, listingId);
}

async function remove(userId, listingId) {
  return favoriteRepository.remove(userId, listingId);
}

module.exports = { findByUserId, create, remove };
