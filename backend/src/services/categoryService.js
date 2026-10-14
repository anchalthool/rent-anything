const categoryRepository = require("../repositories/categoryRepository");

async function findAll() {
  return categoryRepository.findAll();
}

module.exports = { findAll };
