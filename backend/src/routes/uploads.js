const express = require("express");

const router = express.Router();

const authenticate =
  require("../middleware/auth");

const uploadController =
  require("../controllers/uploadController");

const {
  uploadLimiter,
} = require("../middleware/rateLimiters");


router.post(
  "/presign",
  authenticate,
  uploadLimiter,
  uploadController.createUploadUrl
);


// DO NOT use uploadLimiter here
router.get(
  "/view",
  uploadController.createViewUrl
);


module.exports = router;