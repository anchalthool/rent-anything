const crypto = require("crypto");

const supabase =
  require("../configs/supabaseClient");

const redisClient =
  require("../configs/redisClient");


async function createListingUploadUrl({
  userId,
  fileName,
}) {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();


  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp",
  ];


  if (
    !extension ||
    !allowedExtensions.includes(extension)
  ) {
    throw new Error("INVALID_FILE_TYPE");
  }


  const uniqueFileName =
    `${crypto.randomUUID()}.${extension}`;


  const filePath =
    `${userId}/${uniqueFileName}`;


  const { data, error } =
  await supabase.storage
    .from("listings")
    .createSignedUploadUrl(filePath);

if (error) {
  console.error("SUPABASE STORAGE ERROR:", error);
  throw error;
}


  if (error) {
    throw error;
  }


  return {
    path: filePath,
    token: data.token,
    signedUrl: data.signedUrl,
  };
}


async function createViewUrl(path) {
  const cacheKey = `image:view:${path}`;

  // 1. Check Redis first
  try {
    const cachedUrl =
      await redisClient.get(cacheKey);

    if (cachedUrl) {
      console.log(
        "IMAGE CACHE HIT:",
        path
      );

      return {
        signedUrl: cachedUrl,
      };
    }

    console.log(
      "IMAGE CACHE MISS:",
      path
    );

  } catch (error) {
    console.error(
      "Redis image GET failed:",
      error
    );
  }


  // 2. Not in Redis -> ask Supabase
  const { data, error } =
    await supabase.storage
      .from("listings")
      .createSignedUrl(
        path,
        60 * 60
      );


  if (error) {
    throw error;
  }


  // 3. Save the signed URL in Redis
  try {
    await redisClient.set(
      cacheKey,
      data.signedUrl,
      {
        EX: 50 * 60,
      }
    );

    console.log(
      "IMAGE URL CACHED:",
      path
    );

  } catch (error) {
    console.error(
      "Redis image SET failed:",
      error
    );
  }


  return {
    signedUrl: data.signedUrl,
  };
}


module.exports = {
  createListingUploadUrl,
  createViewUrl,
};