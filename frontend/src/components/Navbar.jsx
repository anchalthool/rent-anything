"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/";
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">RentAnything</a>
      </div>

      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/listings">Browse</a>

        {isLoggedIn && (
          <>
            <a href="/favorites">Favorites</a>
            <a href="/bookings">Bookings</a>
            <a href="/my-listings">My Listings</a>
          </>
        )}
      </div>

      <div className="navbar-actions">
        {isLoggedIn ? (
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <a href="/login">Login</a>

            <a
              href="/register"
              className="signup-button"
            >
              Sign Up
            </a>
          </>
        )}
      </div>
    </nav>
  );
}