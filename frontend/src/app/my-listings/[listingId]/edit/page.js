"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();

  const listingId = params.listingId;

  const [listing, setListing] = useState(null);

  const [title, setTitle] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [city, setCity] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadListing() {
      try {
        const res = await fetch(
          `http://localhost:3000/listings/${listingId}`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load listing");
        }

        const data = await res.json();

        setListing(data);
        setTitle(data.title || "");
        setDailyPrice(data.daily_price || "");
        setCity(data.city || "");
      } catch (error) {
        console.error(error);
      }
    }

    if (listingId) {
      loadListing();
    }
  }, [listingId]);

  function handleImageSelect(event) {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  async function handleSave(event) {
    event.preventDefault();

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      // Update title, price, city
      const response = await fetch(
        `http://localhost:3000/listings/${listingId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title,
            dailyPrice: Number(dailyPrice),
            city,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to update listing"
        );
      }

      // Upload new image only if user selected one
      if (selectedImage) {
        const formData = new FormData();

        formData.append("image", selectedImage);

        const imageResponse = await fetch(
          `http://localhost:3000/listings/${listingId}/image`,
          {
            method: "PATCH",

            headers: {
              Authorization: `Bearer ${token}`,
            },

            body: formData,
          }
        );

        const imageData = await imageResponse.json();

        if (!imageResponse.ok) {
          throw new Error(
            imageData.error ||
              "Listing updated but image upload failed"
          );
        }
      }

      alert("Listing updated successfully");

      window.location.href = "/my-listings";
    } catch (error) {
      console.error(error);

      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!listing) {
    return <p>Loading...</p>;
  }

  return (
    <main className="edit-listing-page">
      <div className="edit-listing-card">
        <div className="edit-listing-header">
          <div>
            <p className="edit-listing-eyebrow">
              Manage listing
            </p>

            <h1>Edit Listing</h1>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              router.push("/my-listings")
            }
          >
            Back
          </button>
        </div>

        <div className="edit-listing-grid">
          <section className="edit-listing-form-section">
            <h2>Listing details</h2>

            <form
              onSubmit={handleSave}
              className="edit-listing-form"
            >
              <div className="form-group">
                <label>Title</label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Daily Price</label>

                <input
                  type="number"
                  value={dailyPrice}
                  onChange={(e) =>
                    setDailyPrice(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>City</label>

                <input
                  type="text"
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                />
              </div>

              <div className="edit-listing-image-section">
                <h2>Listing image</h2>

                <div className="edit-image-preview">
                  {imagePreview ||
                  listing.image_url ? (
                    <img
                      src={
                        imagePreview ||
                        listing.image_url
                      }
                      alt={listing.title}
                    />
                  ) : (
                    <div className="edit-image-placeholder">
                      No image yet
                    </div>
                  )}
                </div>

                <label className="upload-button">
                  Choose New Image

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleImageSelect
                    }
                    hidden
                  />
                </label>

                {selectedImage && (
                  <p className="selected-file-name">
                    Selected:{" "}
                    {selectedImage.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}