const pool = require("../db/db");

// ==================================================
// FIND ALL LISTINGS
// ==================================================
async function findAll({
  city,
  category,
  maxPrice,
  search,
  sort,
  excludeOwnerId,
}) {
  let query = `
    SELECT
      listings.id,
      listings.title,
      listings.daily_price,
      listings.city,

      (
        SELECT li.image_url
        FROM listing_images li
        WHERE li.listing_id = listings.id
        ORDER BY
          li.is_primary DESC,
          li.position ASC
        LIMIT 1
      ) AS image_url,

      categories.name AS category,

      users.id AS owner_id,
      users.name AS owner_name

    FROM listings

    JOIN categories
      ON listings.category_id =
         categories.id

    JOIN users
      ON listings.owner_id =
         users.id

    WHERE 1 = 1
  `;

  const values = [];

  // Hide current user's listings
  if (excludeOwnerId) {
    values.push(excludeOwnerId);

    query += `
      AND listings.owner_id
      != $${values.length}
    `;
  }

  // City filter
  if (city) {
    values.push(city);

    query += `
      AND LOWER(listings.city)
      = LOWER($${values.length})
    `;
  }

  // Category filter
  if (category) {
    values.push(category);

    query += `
      AND LOWER(categories.name)
      = LOWER($${values.length})
    `;
  }

  // Price filter
  if (maxPrice !== undefined) {
    values.push(maxPrice);

    query += `
      AND listings.daily_price
      <= $${values.length}
    `;
  }

  // Search
  if (search) {
    values.push(`%${search}%`);

    query += `
      AND listings.title
      ILIKE $${values.length}
    `;
  }

  // Sorting
  if (sort === "price_asc") {
    query += `
      ORDER BY
        listings.daily_price ASC
    `;
  } else if (sort === "price_desc") {
    query += `
      ORDER BY
        listings.daily_price DESC
    `;
  } else {
    query += `
      ORDER BY
        listings.id DESC
    `;
  }

  const result = await pool.query(query, values);

  return result.rows;
}
// ==================================================
// FIND LISTINGS BY OWNER
// ==================================================

async function findByOwnerId(ownerId) {
  const result = await pool.query(
    `
      SELECT
        listings.id,
        listings.title,
        listings.daily_price,
        listings.city,

        (
          SELECT li.image_url
          FROM listing_images li
          WHERE li.listing_id = listings.id
          ORDER BY
            li.is_primary DESC,
            li.position ASC
          LIMIT 1
        ) AS image_url,

        categories.name AS category

      FROM listings

      JOIN categories
        ON listings.category_id = categories.id

      WHERE listings.owner_id = $1

      ORDER BY listings.id DESC
    `,
    [ownerId],
  );

  return result.rows;
}

// ==================================================
// FIND AVAILABILITY
// ==================================================

async function findAvailability(listingId) {
  const result = await pool.query(
    `
      SELECT
        start_date,
        end_date

      FROM bookings

      WHERE listing_id = $1

      AND status IN (
        'pending',
        'approved'
      )

      ORDER BY start_date
      `,
    [listingId],
  );

  return result.rows;
}

// ==================================================
// FIND STATS
// ==================================================

async function findStats(listingId, ownerId) {
  const result = await pool.query(
    `
      SELECT
        listings.id,

        COALESCE(
          booking_stats.total_bookings,
          0
        ) AS total_bookings,

        COALESCE(
          booking_stats.completed_bookings,
          0
        ) AS completed_bookings,

        COALESCE(
          review_stats.average_rating,
          0
        ) AS average_rating


      FROM listings


      LEFT JOIN (

        SELECT
          listing_id,

          COUNT(*)
          AS total_bookings,

          COUNT(*) FILTER (
            WHERE status =
            'completed'
          )
          AS completed_bookings

        FROM bookings

        GROUP BY listing_id

      ) AS booking_stats

      ON booking_stats.listing_id
      = listings.id


      LEFT JOIN (

        SELECT
          listing_id,

          ROUND(
            AVG(rating),
            1
          ) AS average_rating

        FROM reviews

        GROUP BY listing_id

      ) AS review_stats

      ON review_stats.listing_id
      = listings.id


      WHERE listings.id = $1
      AND listings.owner_id = $2
      `,
    [listingId, ownerId],
  );

  return result.rows[0] || null;
}

// ==================================================
// FIND BY ID
// ==================================================

async function findById(listingId) {
  const result = await pool.query(
    `
      SELECT *
      FROM listings
      WHERE id = $1
      `,
    [listingId],
  );

  return result.rows[0] || null;
}

// ==================================================
// CREATE LISTING
// ==================================================

async function create({
  title,
  categoryId,
  dailyPrice,
  city,
  ownerId,
  imageUrl,
}) {
  const result = await pool.query(
    `
      INSERT INTO listings
      (
        title,
        category_id,
        daily_price,
        city,
        owner_id,
        image_url
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )

      RETURNING *
      `,
    [title, categoryId, dailyPrice, city, ownerId, imageUrl],
  );

  return result.rows[0];
}

// ==================================================
// UPDATE Listing
// ==================================================

async function updateListing({
  listingId,
  ownerId,
  title,
  dailyPrice,
  city,
}) {
  const result = await pool.query(
    `
      UPDATE listings

      SET
        title = $1,
        daily_price = $2,
        city = $3

      WHERE id = $4
      AND owner_id = $5

      RETURNING *
    `,
    [
      title,
      dailyPrice,
      city,
      listingId,
      ownerId,
    ],
  );

  return result.rows[0] || null;
}

// ==================================================
// DELETE LISTING
// ==================================================

async function remove(listingId, ownerId) {
  const result = await pool.query(
    `
      DELETE FROM listings

      WHERE id = $1
      AND owner_id = $2

      RETURNING *
      `,
    [listingId, ownerId],
  );

  return result.rows[0] || null;
}

async function findNearby(lat, lng, radiusMiles) {
  const radiusMeters = radiusMiles * 1609.34;

  const result = await pool.query(
    `
    SELECT
      l.id,
      l.title,
      l.daily_price,
      l.city,
      l.category_id,
      l.owner_id,

      (
        SELECT li.image_url
        FROM listing_images li
        WHERE li.listing_id = l.id
        ORDER BY li.is_primary DESC, li.position ASC
        LIMIT 1
      ) AS image_url,

      ST_Y(l.location::geometry) AS latitude,
      ST_X(l.location::geometry) AS longitude,

      ROUND(
        (
          ST_Distance(
            l.location,
            ST_SetSRID(
              ST_MakePoint($2, $1),
              4326
            )::geography
          ) / 1609.34
        )::numeric,
        2
      ) AS distance_miles

    FROM listings l

    WHERE l.location IS NOT NULL

      AND ST_DWithin(
        l.location,
        ST_SetSRID(
          ST_MakePoint($2, $1),
          4326
        )::geography,
        $3
      )

    ORDER BY distance_miles ASC
    `,
    [lat, lng, radiusMeters]
  );

  return result.rows;
}

async function findOwnedListing(
  listingId,
  ownerId
) {
  const result = await pool.query(
    `
    SELECT
      id,
      title,
      owner_id
    FROM listings
    WHERE id = $1
      AND owner_id = $2
    `,
    [listingId, ownerId]
  );

  return result.rows[0];
}

async function findPrimaryImage(listingId) {
  const result = await pool.query(
    `
    SELECT
      id,
      image_url,
      storage_path,
      position,
      is_primary
    FROM listing_images
    WHERE listing_id = $1
    ORDER BY
      is_primary DESC,
      position ASC
    LIMIT 1
    `,
    [listingId]
  );

  return result.rows[0];
}

async function savePrimaryImage(
  listingId,
  imageUrl,
  storagePath
) {
  const currentImage =
    await findPrimaryImage(listingId);

  if (currentImage) {
    const result = await pool.query(
      `
      UPDATE listing_images
      SET
        image_url = $1,
        storage_path = $2,
        position = 0,
        is_primary = TRUE
      WHERE id = $3
      RETURNING *
      `,
      [
        imageUrl,
        storagePath,
        currentImage.id,
      ]
    );

    return result.rows[0];
  }

  const result = await pool.query(
    `
    INSERT INTO listing_images (
      listing_id,
      image_url,
      storage_path,
      position,
      is_primary
    )
    VALUES ($1, $2, $3, 0, TRUE)
    RETURNING *
    `,
    [
      listingId,
      imageUrl,
      storagePath,
    ]
  );

  return result.rows[0];
}
// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  findAll,
  findByOwnerId,
  findAvailability,
  findStats,
  findById,
  findNearby,
  create,
  updateListing,
  remove,
  findOwnedListing,
  findPrimaryImage,
  savePrimaryImage,


};
