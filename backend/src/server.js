require("dotenv").config();

const express = require("express");
const cors = require("cors");

const redisClient = require("./configs/redisClient");

const listingsRoutes = require("./routes/listings");
const categoriesRoutes = require("./routes/categories");
const bookingsRoutes = require("./routes/bookings");
const authRoutes = require("./routes/auth");
const favoritesRoutes = require("./routes/favorites");
const usersRoutes = require("./routes/users");
const reviewsRoutes = require("./routes/reviews");
const paymentRoutes = require("./routes/payments");
const uploadsRoutes = require("./routes/uploads");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

app.use(
  express.json({
    limit: "3mb",
  })
);


app.use("/listings", listingsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/payments", paymentRoutes);
app.use("/uploads", uploadsRoutes);


redisClient.connect();

redisClient.set("test", "hello");

redisClient.get("test").then((value) => {
  console.log(value);
});


app.listen(3000, () => {
  console.log(
    "Server running at http://localhost:3000"
  );
});