"use client";

import { useEffect, useState } from "react";
import OwnerListingCard from "@/components/OwnerListingCard";
import Link from "next/link";

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function loadMyListings() {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/listings/mine", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load your listings");
        return;
      }

      setListings(data);
      setMessage("");
    }

    loadMyListings();
  }, []);

  return (
    <main className="listings-page">
      <div className="listings-header">
        <h2>My Listings</h2>
        <p></p>
        <Link href="/listings/new" className="primary-button">
          + Add Listing
        </Link>
      </div>

      {message && <p>{message}</p>}

      {listings.length === 0 && !message && (
        <p>You haven&apos;t listed anything yet.</p>
      )}

      <div className="listings-grid">
        {listings.map((listing) => (
          <OwnerListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  );
}
