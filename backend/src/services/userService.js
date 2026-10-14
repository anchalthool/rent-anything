const userRepository = require("../repositories/userRepository");

async function findById(userId) {
  return userRepository.findById(userId);
}

async function updateName(name, userId) {
  return userRepository.updateName(name, userId);
}

module.exports = { findById, updateName };
