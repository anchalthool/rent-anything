const listingService =
  require("../services/listingService");
const crypto = require("crypto");
const listingRepo = require("../repositories/listingRepository");
const supabase = require("../configs/supabaseClient");


// ==================================================
// HELPER
// ==================================================

function getValidListingId(id) {
  const listingId = Number(id);

  if (
    !Number.isInteger(listingId) ||
    listingId <= 0
  ) {
    return null;
  }

  return listingId;
}


// ==================================================
// GET ALL LISTINGS
// ==================================================

async function getAllListings(req, res) {
  try {
    const city =
      req.query.city?.trim() || null;

    const category =
      req.query.category?.trim() || null;

    const search =
      req.query.search?.trim() || null;

    const sort =
      req.query.sort;


    let maxPrice;

    if (req.query.maxPrice) {
      maxPrice = Number(
        req.query.maxPrice
      );

      if (
        !Number.isFinite(maxPrice) ||
        maxPrice <= 0
      ) {
        return res.status(400).json({
          message:
            "Maximum price must be greater than zero",
        });
      }
    }


    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );


    const requestedLimit =
      Number(req.query.limit) || 10;


    const limit = Math.min(
      Math.max(
        requestedLimit,
        1
      ),
      50
    );


    const listings =
      await listingService.getAllListings({
        city,
        category,
        maxPrice,
        search,
        sort,
        page,
        limit,
        excludeOwnerId:
          req.userId || null,
      });


    res.json(listings);

  } catch (error) {
    console.error(
      "Error getting listings:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong",
    });
  }
}


// ==================================================
// GET CURRENT USER'S LISTINGS
// ==================================================

async function getMyListings(req, res) {
  try {
    const listings =
      await listingService.getMyListings(
        req.userId
      );

    res.json(listings);

  } catch (error) {
    console.error(
      "Error getting user's listings:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong",
    });
  }
}


// ==================================================
// GET AVAILABILITY
// ==================================================

async function getAvailability(req, res) {
  const listingId =
    getValidListingId(
      req.params.id
    );


  if (!listingId) {
    return res.status(400).json({
      message:
        "Invalid listing ID",
    });
  }


  try {
    const availability =
      await listingService.getAvailability(
        listingId
      );

    res.json(availability);

  } catch (error) {
    console.error(
      "Error getting availability:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong",
    });
  }
}


// ==================================================
// GET STATS
// ==================================================

async function getStats(req, res) {
  const listingId =
    getValidListingId(
      req.params.id
    );


  if (!listingId) {
    return res.status(400).json({
      message:
        "Invalid listing ID",
    });
  }


  try {
    const stats =
      await listingService.getStats(
        listingId,
        req.userId
      );


    if (!stats) {
      return res.status(404).json({
        message:
          "Listing not found",
      });
    }


    res.json(stats);

  } catch (error) {
    console.error(
      "Error getting listing stats:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong",
    });
  }
}


// ==================================================
// GET LISTING BY ID
// ==================================================

async function getListingById(req, res) {
  const listingId =
    getValidListingId(
      req.params.id
    );


  if (!listingId) {
    return res.status(400).json({
      message:
        "Invalid listing ID",
    });
  }


  try {
    const listing =
      await listingService.getListingById(
        listingId
      );


    if (!listing) {
      return res.status(404).json({
        message:
          "Listing not found",
      });
    }


    res.json(listing);

  } catch (error) {
    console.error(
      "Error getting listing:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong",
    });
  }
}


// ==================================================
// CREATE LISTING
// ==================================================

async function createListing(req, res) {

  // Validate title
  if (
    typeof req.body?.title !==
      "string" ||
    req.body.title.trim() === ""
  ) {
    return res.status(400).json({
      message:
        "Title must be a non-empty string",
    });
  }


  // Validate price
  if (
    typeof req.body.dailyPrice !==
      "number" ||
    req.body.dailyPrice <= 0
  ) {
    return res.status(400).json({
      message:
        "Daily price must be a number greater than zero",
    });
  }


  // Validate category
  if (
    typeof req.body.categoryId !==
      "number" ||
    !Number.isInteger(
      req.body.categoryId
    ) ||
    req.body.categoryId <= 0
  ) {
    return res.status(400).json({
      message:
        "Category ID must be a valid number",
    });
  }


  // Validate city
  if (
    typeof req.body.city !==
      "string" ||
    req.body.city.trim() === ""
  ) {
    return res.status(400).json({
      message:
        "City must be a non-empty string",
    });
  }


  const imageUrl =
    req.body.imageUrl ?? null;


  if (imageUrl !== null) {

   if (
  typeof imageUrl !== "string" ||
  !imageUrl.startsWith(
    `${req.userId}/`
  )
) {
  return res.status(400).json({
    message: "Invalid image path",
  });
}


    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ];


    const lowerImageUrl =
      imageUrl.toLowerCase();


    const validExtension =
      allowedExtensions.some(
        (extension) =>
          lowerImageUrl.endsWith(
            extension
          )
      );


    if (!validExtension) {
      return res.status(400).json({
        message:
          "Invalid image type",
      });
    }
  }


  const listingData = {
    title:
      req.body.title.trim(),

    categoryId:
      req.body.categoryId,

    dailyPrice:
      req.body.dailyPrice,

    city:
      req.body.city.trim(),

    ownerId:
      req.userId,

    imageUrl,
  };


  try {
    const newListing =
      await listingService.createListing(
        listingData
      );


    res
      .status(201)
      .json(newListing);

  } catch (error) {
    console.error(
      "Error creating listing:",
      error
    );


    if (error.code === "23503") {
      return res.status(400).json({
        message:
          "Invalid category",
      });
    }


    res.status(500).json({
      message:
        "Something went wrong",
    });
  }
}


// ==================================================
// UPDATE LISTING
// ==================================================

async function updateListing(req, res) {
  const listingId =
    getValidListingId(
      req.params.id
    );

  if (!listingId) {
    return res.status(400).json({
      message:
        "Invalid listing ID",
    });
  }

  const {
    title,
    dailyPrice,
    city,
  } = req.body;

  if (
    typeof title !== "string" ||
    !title.trim()
  ) {
    return res.status(400).json({
      message:
        "Title is required",
    });
  }

  if (
    typeof dailyPrice !== "number" ||
    dailyPrice <= 0
  ) {
    return res.status(400).json({
      message:
        "Daily price must be a number greater than zero",
    });
  }

  if (
    typeof city !== "string" ||
    !city.trim()
  ) {
    return res.status(400).json({
      message:
        "City is required",
    });
  }

  try {
    const listing =
      await listingService.updateListing({
        listingId,
        ownerId:
          req.userId,
        title: title.trim(),
        dailyPrice,
        city: city.trim(),
      });

    if (!listing) {
      return res.status(404).json({
        message:
          "Listing not found",
      });
    }

    res.json(listing);

  } catch (error) {
    console.error(
      "Error updating listing:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong",
    });
  }
}

// ==================================================
// DELETE LISTING
// ==================================================

async function deleteListing(req, res) {
  const listingId =
    getValidListingId(
      req.params.id
    );


  if (!listingId) {
    return res.status(400).json({
      message:
        "Invalid listing ID",
    });
  }


  try {
    const deletedListing =
      await listingService.deleteListing(
        listingId,
        req.userId
      );


    if (!deletedListing) {
      return res.status(404).json({
        message:
          "Listing not found",
      });
    }


    res.json({
      message:
        "Listing deleted",
    });

  } catch (error) {
    console.error(
      "Error deleting listing:",
      error
    );

    res.status(500).json({
      message:
        "Something went wrong",
    });
  }
}

async function getNearbyListings(req, res) {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius || 5);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      Number.isNaN(radius)
    ) {
      return res.status(400).json({
        error: "lat, lng, and radius must be valid numbers",
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        error: "latitude must be between -90 and 90",
      });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        error: "longitude must be between -180 and 180",
      });
    }

    if (radius <= 0 || radius > 50) {
      return res.status(400).json({
        error: "radius must be greater than 0 and at most 50 miles",
      });
    }

    const listings = await listingService.getNearbyListings(
      lat,
      lng,
      radius
    );

    return res.json(listings);
  } catch (error) {
    console.error("Nearby listings error:", error);

    return res.status(500).json({
      error: "Failed to fetch nearby listings",
    });
  }
}
async function updateListingImage(req, res) {
  let newStoragePath = null;

  try {
    const listingId = Number(req.params.id);
    const ownerId = req.userId;

    // Validate listing ID
    if (!Number.isInteger(listingId)) {
      return res.status(400).json({
        error: "Invalid listing ID",
      });
    }

    // Make sure file was sent
    if (!req.file) {
      return res.status(400).json({
        error: "Please select an image",
      });
    }


    // ---------------------------------
    // Check that this user owns listing
    // ---------------------------------

    const listing =
      await listingRepo.findOwnedListing(
        listingId,
        ownerId
      );

    if (!listing) {
      return res.status(403).json({
        error:
          "You are not allowed to edit this listing",
      });
    }


    // ---------------------------------
    // Find existing primary image
    // ---------------------------------

    const oldImage =
      await listingRepo.findPrimaryImage(
        listingId
      );


    // ---------------------------------
    // File extension
    // ---------------------------------

    let extension = "jpg";

    if (req.file.mimetype === "image/png") {
      extension = "png";
    }

    if (req.file.mimetype === "image/webp") {
      extension = "webp";
    }


    // ---------------------------------
    // IMPORTANT:
    // create brand-new filename
    // ---------------------------------

    const fileName =
      `${crypto.randomUUID()}.${extension}`;

    newStoragePath =
      `listings/${listingId}/${fileName}`;


    const bucket =
      process.env.SUPABASE_BUCKET ||
      "listings";


    // ---------------------------------
    // Upload to Supabase
    // ---------------------------------

    const {
      error: uploadError,
    } = await supabase.storage
      .from(bucket)
      .upload(
        newStoragePath,
        req.file.buffer,
        {
          contentType:
            req.file.mimetype,

          cacheControl: "3600",

          upsert: false,
        }
      );


    if (uploadError) {
      console.error(
        "Supabase upload error:",
        uploadError
      );

      return res.status(500).json({
        error:
          "Could not upload image",
      });
    }


    // ---------------------------------
    // Get public URL
    // ---------------------------------

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(bucket)
      .getPublicUrl(
        newStoragePath
      );


    const imageUrl =
      publicUrlData.publicUrl;


    // ---------------------------------
    // Save into PostgreSQL
    // ---------------------------------

    const savedImage =
      await listingRepo.savePrimaryImage(
        listingId,
        imageUrl,
        newStoragePath
      );


    // ---------------------------------
    // Delete old Supabase object
    // AFTER database update succeeded
    // ---------------------------------

    if (
      oldImage?.storage_path &&
      oldImage.storage_path !==
        newStoragePath
    ) {
      const {
        error: deleteError,
      } = await supabase.storage
        .from(bucket)
        .remove([
          oldImage.storage_path,
        ]);


      if (deleteError) {
        console.error(
          "Could not delete old image:",
          deleteError
        );
      }
    }


    return res.json({
      message:
        "Listing image updated successfully",

      image_url:
        savedImage.image_url,
    });

  } catch (error) {
    console.error(
      "Update listing image error:",
      error
    );


    // If upload succeeded but DB failed,
    // clean up newly uploaded file
    if (newStoragePath) {
      try {
        const bucket =
          process.env.SUPABASE_BUCKET ||
          "listings";

        await supabase.storage
          .from(bucket)
          .remove([
            newStoragePath,
          ]);

      } catch (cleanupError) {
        console.error(
          "Cleanup error:",
          cleanupError
        );
      }
    }


    return res.status(500).json({
      error:
        "Unable to update listing image",
    });
  }
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
  deleteListing,
  getNearbyListings,
  updateListingImage,
};