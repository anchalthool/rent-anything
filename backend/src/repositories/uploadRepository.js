const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../configs/s3Client");

async function createUploadUrl(key, fileType) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 60 });
}

async function createViewUrl(key) {
  const command = new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: 300 });
}

module.exports = { createUploadUrl, createViewUrl };
