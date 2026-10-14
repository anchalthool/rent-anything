"use client";

import { useState } from "react";

export default function S3UploadTest() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  async function uploadFile() {
    if (!file) {
      setMessage("Choose a file first");
      return;
    }

    const token = localStorage.getItem("token");

    // 1. Ask backend for presigned URL
    const presignRes = await fetch(
      "http://localhost:3000/uploads/presign",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      }
    );

    const presignData = await presignRes.json();

    if (!presignRes.ok) {
      setMessage(
        presignData.message || "Could not create upload URL"
      );
      return;
    }

    // 2. Upload file directly to S3
    const uploadRes = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      setMessage("S3 upload failed");
      return;
    }

    setMessage(`Uploaded successfully: ${presignData.key}`);
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={uploadFile}>
        Upload test image
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}