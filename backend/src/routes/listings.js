const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth");
const optionalAuthenticate = require("../middleware/optionalAuthenticate");
const upload = require("../middleware/upload");

const listingController = require("../controllers/listingController");


// GET ALL LISTINGS
router.get(
  "/",
  optionalAuthenticate,
  listingController.getAllListings
);


// GET NEARBY LISTINGS
router.get(
  "/nearby",
  listingController.getNearbyListings
);


// GET CURRENT USER'S LISTINGS
router.get(
  "/mine",
  authenticate,
  listingController.getMyListings
);


// GET AVAILABILITY
router.get(
  "/:id/availability",
  listingController.getAvailability
);


// GET STATS
router.get(
  "/:id/stats",
  authenticate,
  listingController.getStats
);


// GET LISTING BY ID
router.get(
  "/:id",
  listingController.getListingById
);


// CREATE LISTING
router.post(
  "/",
  authenticate,
  listingController.createListing
);


// UPDATE NORMAL LISTING DATA
router.patch(
  "/:id",
  authenticate,
  listingController.updateListing
);


// UPDATE LISTING IMAGE
router.patch(
  "/:id/image",
  authenticate,
  upload.single("image"),
  listingController.updateListingImage
);


// DELETE LISTING
router.delete(
  "/:id",
  authenticate,
  listingController.deleteListing
);


module.exports = router;