const redisClient =
  require("../configs/redisClient");

const listingRepository =
  require("../repositories/listingRepository");

const uploadService = require("./uploadService");


// ==================================================
// GET ALL LISTINGS
// ==================================================

async function getAllListings(filters) {
  const listings =
    await listingRepository.findAll(filters);

  const listingsWithImages =
    await Promise.all(
      listings.map(async (listing) => {
        if (!listing.image_url) {
          return {
            ...listing,
            image_view_url: null,
          };
        }

        try {
          const { signedUrl } =
            await uploadService.createViewUrl(
              listing.image_url
            );

          return {
            ...listing,
            image_view_url: signedUrl,
          };

        } catch (error) {
          console.error(
            `Could not load image for listing ${listing.id}:`,
            error.message
          );

          return {
            ...listing,
            image_view_url: null,
          };
        }
      })
    );

  return listingsWithImages;
}


// ==================================================
// GET CURRENT USER'S LISTINGS
// ==================================================

async function getMyListings(userId) {
  return listingRepository.findByOwnerId(userId);
}


// ==================================================
// GET AVAILABILITY
// ==================================================

async function getAvailability(listingId) {
  return listingRepository.findAvailability(
    listingId
  );
}


// ==================================================
// GET STATS
// ==================================================

async function getStats(
  listingId,
  ownerId
) {
  return listingRepository.findStats(
    listingId,
    ownerId
  );
}


// ==================================================
// GET LISTING BY ID
// ==================================================

async function getListingById(listingId) {
  const cacheKey = `listing:${listingId}`;

  try {
    const cachedListing =
      await redisClient.get(cacheKey);

    if (cachedListing) {
      console.log("CACHE HIT:", cacheKey);

      return JSON.parse(cachedListing);
    }

    console.log("CACHE MISS:", cacheKey);

  } catch (error) {
    console.error(
      "Redis GET failed:",
      error
    );
  }

  const listing =
    await listingRepository.findById(
      listingId
    );

  if (!listing) {
    return null;
  }

  try {
    await redisClient.set(
      cacheKey,
      JSON.stringify(listing),
      {
        EX: 60,
      }
    );

    console.log("CACHED:", cacheKey);

  } catch (error) {
    console.error(
      "Redis SET failed:",
      error
    );
  }

  return listing;
}

// ==================================================
// CREATE LISTING
// ==================================================

async function createListing(listingData) {
  const newListing =
    await listingRepository.create(listingData);

  return newListing;
}

// ==================================================
// UPDATE LISTING
// ==================================================

async function updateListing({
  listingId,
  ownerId,
  title,
  dailyPrice,
  city,
}) {
  const listing =
    await listingRepository.updateListing({
      listingId,
      ownerId,
      title,
      dailyPrice,
      city,
    });

  if (!listing) {
    return null;
  }

  try {
    await redisClient.del(
      `listing:${listingId}`
    );
  } catch (error) {
    console.error(
      "Redis invalidation failed:",
      error
    );
  }

  return listing;
}

// ==================================================
// DELETE LISTING
// ==================================================

async function deleteListing(
  listingId,
  ownerId
) {
  const deletedListing =
    await listingRepository.remove(
      listingId,
      ownerId
    );

  if (!deletedListing) {
    return null;
  }

  try {
    await redisClient.del(
      `listing:${listingId}`
    );
  } catch (error) {
    console.error(
      "Redis invalidation failed:",
      error
    );
  }

  return deletedListing;
}

// ==================================================
// Get nearby listing
// ==================================================
async function getNearbyListings(lat, lng, radiusMiles) {
  return await listingRepository.findNearby(
    lat,
    lng,
    radiusMiles
  );
}

// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  getAllListings,
  getMyListings,
  getAvailability,
  getStats,
  getListingById,
  createListing,
  updateListing,
  getNearbyListings,
  deleteListing,

};