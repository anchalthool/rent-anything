
const favoriteRepository = require("../repositories/favoriteRepository");
const uploadService = require("./uploadService");

async function findByUserId(userId) {
  const result = await favoriteRepository.findByUserId(userId);

  const rows = await Promise.all(
    result.rows.map(async (listing) => {
      if (!listing.image_url) {
        return {
          ...listing,
          image_view_url: null,
        };
      }

      try {
        const { signedUrl } =
          await uploadService.createViewUrl(listing.image_url);

        return {
          ...listing,
          image_view_url: signedUrl,
        };
      } catch (error) {
        console.error("Favorite image error:", error);

        return {
          ...listing,
          image_view_url: null,
        };
      }
    })
  );

  return {
    ...result,
    rows,
  };
}

async function create(userId, listingId) {
  return favoriteRepository.create(userId, listingId);
}

async function remove(userId, listingId) {
  return favoriteRepository.remove(userId, listingId);
}

module.exports = { findByUserId, create, remove };
