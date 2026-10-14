const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const favoriteController = require("../controllers/favoriteController");

router.get("/", authenticate, favoriteController.getFavorites);
router.post("/:listingId", authenticate, favoriteController.addFavorite);
router.delete("/:listingId", authenticate, favoriteController.removeFavorite);

module.exports = router;
