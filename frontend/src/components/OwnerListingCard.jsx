"use client";

import Link from "next/link";

export default function OwnerListingCard({ listing }) {
  return (
    <div className="listing-card">
      <div className="listing-image">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            className="listing-card-image"
          />
        ) : (
          <div className="no-image">No image</div>
        )}
      </div>

      <div className="listing-card-content">
        <h3>{listing.title}</h3>

        <div className="listing-footer">
          <span className="listing-price">${listing.daily_price} / day</span>
        </div>

        <div className="owner-listing-actions">
          <Link href={`/listings/${listing.id}`}>View</Link>

          <Link href={`/my-listings/${listing.id}/edit`}>Edit</Link>

          <Link href={`/my-listings/${listing.id}/stats`}>Stats</Link>
        </div>
      </div>
    </div>
  );
}
