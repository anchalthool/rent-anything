const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const reviewController = require("../controllers/reviewController");

router.get("/:listingId", reviewController.getListingReviews);
router.post("/:listingId", authenticate, reviewController.createReview);

module.exports = router;
