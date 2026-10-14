"use client";

import { useState } from "react";
import { Heart, MapPin, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ListingCard({
  listing,
  initialFavorite = false,
}) {
  const [isFavorite, setIsFavorite] =
    useState(initialFavorite);

  const [message, setMessage] =
    useState("");

  async function toggleFavorite() {
    const token =
      localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first");
      return;
    }

    const method =
      isFavorite ? "DELETE" : "POST";

    try {
      const res = await fetch(
        `http://localhost:3000/favorites/${listing.id}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Something went wrong"
        );
        return;
      }

      setIsFavorite(
        (current) => !current
      );

      setMessage("");
    } catch (error) {
      console.error(
        "Favorite update failed:",
        error
      );

      setMessage(
        "Something went wrong"
      );
    }
  }

  return (
    <div className="listing-card">
      <div className="listing-image">
        {listing.image_url ? (
  <Image
    src={listing.image_url}
    width={640}
    height={480}
    unoptimized
            alt={listing.title}
            className="listing-card-image"
          />
        ) : (
          <div className="no-image">
            <Package size={38} strokeWidth={1} />
            <span>No image available</span>
          </div>
        )}
      </div>

      <div className="listing-card-content">
        <p className="listing-category">{listing.category_name || "Available to rent"}</p>
        <h3>
          <Link
            className="listing-title-link"
            href={`/listings/${listing.id}`}
          >
            {listing.title}
          </Link>
        </h3>

        {listing.city && <p className="listing-city"><MapPin size={14} /> {listing.city}</p>}
        <div className="listing-footer">
          <span className="listing-price">
            ${listing.daily_price} <span className="price-unit">/ day</span>
          </span>

          <div className="listing-actions">
            <button
              className="favorite-button"
              onClick={toggleFavorite}
              aria-label={
                isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              aria-pressed={isFavorite}
              type="button"
            >
              <Heart
                size={22}
                strokeWidth={2}
                fill={
                  isFavorite
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          </div>
        </div>

        {message && (
          <p role="status">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}