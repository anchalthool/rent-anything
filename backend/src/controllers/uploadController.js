const uploadService = require("../services/uploadService");

async function createUploadUrl(req, res) {
  try {
    const { fileName } = req.body;

    if (
      typeof fileName !== "string" ||
      !fileName.trim()
    ) {
      return res.status(400).json({
        message: "fileName is required",
      });
    }

    const result =
      await uploadService.createListingUploadUrl({
        userId: req.userId,
        fileName,
      });

    res.json(result);

  } catch (error) {
    console.error(
      "Error creating upload URL:",
      error
    );

    if (error.message === "INVALID_FILE_TYPE") {
      return res.status(400).json({
        message: "Invalid image type",
      });
    }

    res.status(500).json({
      message: "Could not create upload URL",
    });
  }
}


async function createViewUrl(req, res) {
  try {
    const { path } = req.query;

    if (
      typeof path !== "string" ||
      !path.trim()
    ) {
      return res.status(400).json({
        message: "path is required",
      });
    }

    const result =
      await uploadService.createViewUrl(path);

    res.json(result);

  } catch (error) {
    console.error(
      "Error creating view URL:",
      error
    );

    res.status(500).json({
      message: "Could not create view URL",
    });
  }
}


module.exports = {
  createUploadUrl,
  createViewUrl,
};