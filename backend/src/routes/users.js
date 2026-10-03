const express = require("express");
const router = express.Router();

const pool = require("../db/db");
const authenticate = require("../middleware/auth");

router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email
       FROM users
       WHERE id = $1`,
      [req.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
});


router.patch("/me", authenticate, async (req, res) => {
  const name = req.body.name;

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      message: "Name is required"
    });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = $1
       WHERE id = $2
       RETURNING id, name, email`,
      [name.trim(), req.userId]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
});

module.exports = router;