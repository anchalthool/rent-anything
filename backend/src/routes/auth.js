const express = require("express");
const router = express.Router();

const pool = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;


  // Check name
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      message: "Name is required"
    });
  }


  // Check email
  if (typeof email !== "string" || email.trim() === "") {
    return res.status(400).json({
      message: "Email is required"
    });
  }


  // Check password
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters"
    });
  }


  try {

    // Turn password into a hash
    const passwordHash = await bcrypt.hash(password, 10);


    // Save user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        passwordHash
      ]
    );


    const newUser = result.rows[0];

    res.status(201).json(newUser);


  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });

  }

});

router.post("/login", async (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  if (
    typeof email !== "string" ||
    email.trim() === ""
  ) {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  if (
    typeof password !== "string" ||
    password === ""
  ) {
    return res.status(400).json({
      message: "Password is required"
    });
  }

  try {

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.trim().toLowerCase()]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
  {
    userId: user.id
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1h"
  }
);

    res.json({
      message: "Login successful",
      token:token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });

  }

});

module.exports = router;