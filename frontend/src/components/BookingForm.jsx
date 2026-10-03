"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export default function BookingForm({ listingId }) {
  const [range, setRange] = useState();
  const [message, setMessage] = useState("");
  const [unavailableDates, setUnavailableDates] = useState([]);

  useEffect(() => {
    async function loadAvailability() {
      const res = await fetch(
        `http://localhost:3000/listings/${listingId}/availability`
      );

      const data = await res.json();

      if (res.ok) {
        setUnavailableDates(data);
      }
    }

    loadAvailability();
  }, [listingId]);

  const disabledRanges = unavailableDates.map((booking) => ({
    from: new Date(booking.start_date),
    to: new Date(booking.end_date),
  }));

  async function handleBooking() {
    if (!range?.from || !range?.to) {
      setMessage("Please select a start and end date");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3000/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        listingId,
        startDate: range.from.toISOString().split("T")[0],
        endDate: range.to.toISOString().split("T")[0],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message);
      return;
    }

    setMessage("Booking created!");
  }

  return (
    <div className="booking-form">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        disabled={disabledRanges}
      />

      <button
        className="primary-button"
        onClick={handleBooking}
      >
        Rent this item
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}