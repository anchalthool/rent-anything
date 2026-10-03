const jwt = require("jsonwebtoken");

function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
  } catch (error) {
    // Invalid token — treat as logged out for this public route
  }

  next();
}

module.exports = optionalAuthenticate;