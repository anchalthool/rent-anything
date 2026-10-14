const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const userController = require("../controllers/userController");

router.get("/me", authenticate, userController.getMe);
router.patch("/me", authenticate, userController.updateMe);

module.exports = router;
