const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const bookingController = require("../controllers/bookingController");

router.post("/", authenticate, bookingController.createBooking);
router.get("/received", authenticate, bookingController.getReceivedBookings);
router.patch("/:id/status", authenticate, bookingController.updateStatus);
router.patch("/:id/cancel", authenticate, bookingController.cancelBooking);
router.patch("/:id/complete", authenticate, bookingController.completeBooking);
router.get("/:id/checkout", authenticate, bookingController.getCheckout);
router.patch("/:id/pay", authenticate, bookingController.payBooking);
router.get("/mine", authenticate, bookingController.getMyBookings);

module.exports = router;
