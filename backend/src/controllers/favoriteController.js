const favoriteService = require("../services/favoriteService");

async function getFavorites(req, res) {
  try {
    const result = await favoriteService.findByUserId(req.userId);

    res.json(result.rows);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
}

async function addFavorite(req, res) {
  const listingId = Number(req.params.listingId);

  try {
    const result = await favoriteService.create(req.userId, listingId);

    res.status(201).json(result.rows[0]);

  } catch (error) {
  if (error.code === "23505") {
    return res.status(409).json({
      message: "Listing already favorited"
    });
  }

  console.log(error);

  res.status(500).json({
    message: "Something went wrong"
  });
}
}

async function removeFavorite(req, res) {
  const listingId = Number(req.params.listingId);

  try {
    const result = await favoriteService.remove(req.userId, listingId);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Favorite not found"
      });
    }

    res.json({
      message: "Favorite removed"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
}

module.exports = { getFavorites, addFavorite, removeFavorite };
