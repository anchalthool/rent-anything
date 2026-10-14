const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");

router.post("/:bookingId", authenticate, paymentController.createPayment);

module.exports = router;
