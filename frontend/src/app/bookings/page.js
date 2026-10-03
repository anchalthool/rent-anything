"use client";

import { useEffect, useState } from "react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function loadBookings() {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/bookings/mine", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load bookings");
        return;
      }

      setBookings(data);
      setMessage("");
    }

    loadBookings();
  }, []);

  return (
    <main className="bookings-page">
      <div className="bookings-header">
        <p className="hero-eyebrow">Your rentals</p>
        <h1>My Bookings</h1>
      </div>

      {message && <p>{message}</p>}

      <div className="bookings-grid">
        {bookings.map((booking) => (
          <div className="booking-card" key={booking.id}>
            <h2>{booking.title}</h2>

            <p>{booking.city}</p>

            <p>
              {new Date(booking.start_date).toLocaleDateString()}
              {" → "}
              {new Date(booking.end_date).toLocaleDateString()}
            </p>

            <p>
              ${booking.daily_price_at_booking} / day
            </p>

            <p>
              Status: {booking.status}
            </p>

            <p>
              Payment: {booking.payment_status}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}