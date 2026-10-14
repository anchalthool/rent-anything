const categoryService = require("../services/categoryService");

async function getAllCategories(req, res) {

  try {

    const result = await categoryService.findAll();

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });

  }

}

module.exports = { getAllCategories };
