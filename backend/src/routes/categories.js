const express = require("express");
const router = express.Router();

const pool = require("../db/db");


router.get("/", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM categories ORDER BY id"
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });

  }

});

module.exports = router;