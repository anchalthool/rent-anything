const reviewService = require("../services/reviewService");

async function getListingReviews(req, res) {
  const listingId = Number(req.params.listingId);

  try {
    const result = await reviewService.findByListingId(listingId);
    res.json(result.rows);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
}

async function createReview(req, res) {
  const listingId = Number(req.params.listingId);
  const rating = Number(req.body.rating);
  const comment = req.body.comment;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Rating must be between 1 and 5",
    });
  }

  try {
    const result = await reviewService.create(listingId, req.userId, rating, comment);

    if (!result) {
      return res.status(403).json({
        message: "You can only review listings you have rented",
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "You already reviewed this listing",
      });
    }

    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
}

module.exports = { getListingReviews, createReview };
