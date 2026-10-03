"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/ListingCard";

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token");

        // 1. Load listings
        // Send token so backend can hide my own listings
        const listingsRes = await fetch("http://localhost:3000/listings", {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        });

        const listingsData = await listingsRes.json();

        if (!listingsRes.ok) {
          setMessage(
            listingsData.message || "Failed to load listings"
          );
          return;
        }

        setListings(listingsData);

        // 2. Load favorites only if logged in
        if (token) {
          const favoritesRes = await fetch(
            "http://localhost:3000/favorites",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (favoritesRes.ok) {
            const favoritesData = await favoritesRes.json();

            const ids = favoritesData.map((item) => item.id);

            setFavoriteIds(ids);
          }
        }

        setMessage("");
      } catch (error) {
        console.log(error);
        setMessage("Something went wrong");
      }
    }

    loadData();
  }, []);

  return (
    <main className="listings-page">
      <div className="listings-header">
        <p className="hero-eyebrow">Explore nearby</p>

        <h1>Browse listings</h1>
      </div>

      {message && <p>{message}</p>}

      {!message && listings.length === 0 && (
        <p>No listings available right now.</p>
      )}

      <div className="listings-grid">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            initialFavorite={favoriteIds.includes(listing.id)}
          />
        ))}
      </div>
    </main>
  );
}