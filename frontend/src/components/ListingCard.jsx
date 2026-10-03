"use client";

import { useEffect, useState } from "react";

export default function ListingCard({
  listing,
  initialFavorite = false
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setIsFavorite(initialFavorite);
  }, [initialFavorite]);

  async function toggleFavorite() {
    const token = localStorage.getItem("token");

    const method = isFavorite ? "DELETE" : "POST";

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
      setMessage(data.message || "Something went wrong");
      return;
    }

    setIsFavorite(!isFavorite);
  }

  return (
    <div className="listing-card">
      <div className="listing-image">
        <span>No image yet</span>
      </div>

      <div className="listing-card-content">
        <p className="listing-category">
          {listing.category || "General"}
        </p>

        <h3>{listing.title}</h3>

        <p className="listing-city">
          {listing.city}
        </p>

        <div className="listing-footer">
          <span className="listing-price">
            ${listing.daily_price} / day
          </span>

          <div className="listing-actions">
            <button
              className="favorite-button"
              onClick={toggleFavorite}
            >
              {isFavorite ? "♥" : "♡"}
            </button>

            <a href={`/listings/${listing.id}`}>
              View
            </a>
          </div>
        </div>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}