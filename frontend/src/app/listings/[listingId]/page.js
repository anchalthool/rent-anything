import Image from "next/image";
import BookingForm from "@/components/BookingForm";

export default async function ListingDetails({ params }) {
  const { listingId } = await params;

  const res = await fetch(
    `http://localhost:3000/listings/${listingId}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch listing");
  }

  const listing = await res.json();

  return (
    <main className="listing-details-page">
      <div className="listing-details-card">

        <div className="listing-details-image">
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={listing.title}
              width={640}
              height={420}
              unoptimized
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          ) : (
            "No image yet"
          )}
        </div>

        <div className="listing-details-content">
          <p className="listing-category">
            {listing.category_name || "General"}
          </p>

          <h1>{listing.title}</h1>

          <p className="listing-details-city">
            {listing.city}
          </p>

          <p className="listing-details-price">
            ${listing.daily_price} / day
          </p>

          <BookingForm listingId={listing.id} />
        </div>

      </div>
    </main>
  );
}