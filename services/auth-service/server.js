
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/auth");

const app = express();

// Allow requests from Next.js frontend
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "auth-service",
    status: "healthy",
  });
});

// Authentication routes
app.use("/auth", authRoutes);

app.listen(3003, () => {
  console.log("Auth Service running on port 3003");
});
