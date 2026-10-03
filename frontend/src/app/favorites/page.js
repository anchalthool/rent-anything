"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/ListingCard";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function loadFavorites() {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load favorites");
        return;
      }

      setFavorites(data);
      setMessage("");
    }

    loadFavorites();
  }, []);

  return (
    <main className="listings-page">
      <div className="listings-header">
        <p className="hero-eyebrow">Saved for later</p>
        <h1>Favorites</h1>
      </div>

      {message && <p>{message}</p>}

      <div className="listings-grid">
        {favorites.map((listing) => (
  <ListingCard
    key={listing.id}
    listing={listing}
    initialFavorite={true}
  />
))}
      </div>
    </main>
  );
}