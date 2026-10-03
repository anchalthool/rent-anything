"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddListingPage() {
  const [title, setTitle] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function loadCategories() {
      const res = await fetch("http://localhost:3000/categories");

      const data = await res.json();

      if (res.ok) {
        setCategories(data);
      }
    }

    loadCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first");
      return;
    }

    const res = await fetch("http://localhost:3000/listings", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        title,
        dailyPrice: Number(dailyPrice),
        city,
        categoryId: Number(categoryId),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Failed to create listing");
      return;
    }

    setMessage("Listing created!");

    setTimeout(() => {
      router.push("/my-listings");
    }, 800);
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>List an item</h1>

        <label>
          Item name
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Camera"
            required
          />
        </label>

        <label>
          Daily price
          <input
            type="number"
            value={dailyPrice}
            onChange={(e) => setDailyPrice(e.target.value)}
            placeholder="20"
            min="1"
            required
          />
        </label>

        <label>
          City
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Boston"
            required
          />
        </label>

        <label>
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Choose a category</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <button
          className="primary-button"
          type="submit"
        >
          Create Listing
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  );
}