const {
  rateLimit,
  ipKeyGenerator,
} = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,

  message: {
    message: "Too many login attempts. Please try again later.",
  },
});


const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,

  keyGenerator: (req) => {
    if (req.userId) {
      return `user:${req.userId}`;
    }

    return ipKeyGenerator(req.ip);
  },

  message: {
    message: "Too many upload requests. Please try again shortly.",
  },
});


const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,

  keyGenerator: (req) => {
    if (req.userId) {
      return `user:${req.userId}`;
    }

    return ipKeyGenerator(req.ip);
  },

  message: {
    message: "Too many booking requests. Please try again shortly.",
  },
});


module.exports = {
  loginLimiter,
  uploadLimiter,
  bookingLimiter,
};