"use client";

import { useEffect, useState } from "react";
// import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AddListingPage() {
  const [title, setTitle] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  // Actual image file that we'll upload to Supabase
  const [image, setImage] = useState(null);

  // Temporary local URL just for showing the preview
  const [imagePreview, setImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("http://localhost:3000/categories");
        const data = await res.json();

        if (res.ok) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Could not load categories:", error);
      }
    }

    loadCategories();
  }, []);

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setImage(null);
    setImagePreview(null);
    setMessage("");

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const maxSize = 2 * 1024 * 1024;

    if (
      !allowedTypes.includes(file.type) ||
      file.size > maxSize
    ) {
      setMessage(
        "Choose a JPG, PNG, or WebP image up to 2 MB."
      );

      event.target.value = "";
      return;
    }

    // Keep the real File object for Supabase
    setImage(file);

    // Create local preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }
async function handleSubmit(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");

  if (!token) {
    setMessage("Please login first");
    return;
  }

  if (submitting) return;

  setSubmitting(true);
  setMessage("");

  try {
    let imagePath = null;

    // 1. If user selected an image,
    // ask backend for a Supabase signed upload URL
    if (image) {
      const presignRes = await fetch(
        "http://localhost:3000/uploads/presign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: image.name,
          }),
        }
      );

      const presignData = await presignRes.json();

      if (!presignRes.ok) {
        setMessage(
          presignData.message ||
            "Could not prepare image upload"
        );
        return;
      }

      // 2. Upload image directly
      // from browser to Supabase Storage
      const uploadRes = await fetch(
        presignData.signedUrl,
        {
          method: "PUT",
          headers: {
            "Content-Type": image.type,
          },
          body: image,
        }
      );

      if (!uploadRes.ok) {
        setMessage("Image upload failed");
        return;
      }

      // Save the Supabase object path
      imagePath = presignData.path;
    }

    // 3. Create listing in PostgreSQL
    const listingRes = await fetch(
      "http://localhost:3000/listings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          title,
          dailyPrice: Number(dailyPrice),
          city,
          categoryId: Number(categoryId),

          imageUrl: imagePath,
        }),
      }
    );

    const listingData =
      await listingRes.json();

    if (!listingRes.ok) {
      setMessage(
        listingData.message ||
          "Failed to create listing"
      );
      return;
    }

    setMessage("Listing created!");

    setTimeout(() => {
      router.push("/my-listings");
    }, 800);

  } catch (error) {
    console.error(error);

    setMessage(
      "Could not create listing. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
}

  return (
    <main className="auth-page">
      <form
        className="auth-card"
        onSubmit={handleSubmit}
      >
        <h1>List an item</h1>

        <label>
          Item name
          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Camera"
            required
          />
        </label>

        <label>
          Daily price
          <input
            type="number"
            value={dailyPrice}
            onChange={(e) =>
              setDailyPrice(e.target.value)
            }
            placeholder="20"
            min="1"
            required
          />
        </label>

        <label>
          City
          <input
            type="text"
            value={city}
            onChange={(e) =>
              setCity(e.target.value)
            }
            placeholder="Boston"
            required
          />
        </label>

        <label>
          Category
          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(e.target.value)
            }
            required
          >
            <option value="">
              Choose a category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Upload image (optional)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={submitting}
            aria-describedby="image-help"
          />
        </label>

        <p id="image-help">
          JPG, PNG, or WebP, up to 2 MB.
        </p>

        {imagePreview ? (
  <img
    src={imagePreview}
    alt="Selected listing image"
    style={{
      width: "100%",
      height: "200px",
      objectFit: "contain",
    }}
  />
) : null}

        <button
          disabled={submitting}
          className="primary-button"
          type="submit"
        >
          {submitting
            ? "Creating…"
            : "Create Listing"}
        </button>

        {message && (
          <p role="status">{message}</p>
        )}
      </form>
    </main>
  );
}