"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import ListingCard from "@/components/ListingCard";

function ListingsContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [message, setMessage] = useState("Loading...");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [radius, setRadius] = useState(5);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token");

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

  async function handleNearMe() {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      return;
    }

    setMessage("Finding listings near you...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const response = await fetch(
            `http://localhost:3000/listings/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
          );

          const data = await response.json();

          if (!response.ok) {
            setMessage(
              data.error || "Failed to load nearby listings"
            );
            return;
          }

          setListings(data);

          if (data.length === 0) {
            setMessage(
              `No listings found within ${radius} miles.`
            );
            return;
          }

          setMessage("");
        } catch (error) {
          console.error(error);
          setMessage("Something went wrong");
        }
      },
      (error) => {
        console.error("Location error:", error);

        if (error.code === 1) {
          setMessage("Location permission was denied.");
        } else if (error.code === 2) {
          setMessage("Your location could not be determined.");
        } else if (error.code === 3) {
          setMessage("Getting your location took too long.");
        } else {
          setMessage("Could not access your location.");
        }
      }
    );
  }

  const filteredListings = listings.filter((listing) =>
    [listing.title, listing.city, listing.category_name].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="listings-page">
      <div className="listings-header">
        <p className="hero-eyebrow">Explore nearby</p>

        <h1>Find your next thing.</h1>
        <p>For the big adventures and the little everyday moments.</p>
      </div>

      <div className="nearby-controls">
        <label className="search-field"><Search size={20} /><input aria-label="Search listings" placeholder="Search items, categories, or cities" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="radius-control">
          <label htmlFor="radius">
            Radius: {radius} miles
          </label>

          <input
            id="radius"
            type="range"
            min="1"
            max="50"
            step="1"
            value={radius}
            onChange={(e) =>
              setRadius(Number(e.target.value))
            }
          />
        </div>

        <button className="primary-button" onClick={handleNearMe}>
          <MapPin size={17} />
          Near me
        </button>
      </div>

      {message && <p className="page-message" role="status">{message}</p>}

      {!message && listings.length === 0 && (
        <p className="page-message">No listings available right now. Check back soon for something new.</p>
      )}

      {!message && listings.length > 0 && <p className="results-count">{filteredListings.length} {filteredListings.length === 1 ? "item" : "items"} to explore</p>}
      {!message && listings.length > 0 && filteredListings.length === 0 && <p className="page-message">No matches. Try a different item, category, or city.</p>}
      <div className="listings-grid">
        {filteredListings.map((listing) => (
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
export default function ListingsPage() {
  return <Suspense fallback={<main className="listings-page"><p className="page-message">Loading rentals…</p></main>}><ListingsContent /></Suspense>;
}
