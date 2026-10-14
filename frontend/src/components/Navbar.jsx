"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Layers } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    function checkAuth() {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }

    checkAuth();

    window.addEventListener("authChanged", checkAuth);

    return () => {
      window.removeEventListener("authChanged", checkAuth);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");

    window.dispatchEvent(new Event("authChanged"));

    router.push("/");
  }

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-logo">
        <Link href="/" aria-label="RentAnything home"><span className="brand-mark"><Layers size={22} /></span>rentanything<span className="brand-dot">.</span></Link>
      </div>

      <div className="navbar-links">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
        <Link href="/listings" aria-current={pathname.startsWith("/listings") ? "page" : undefined}>Explore rentals</Link>

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
              Get started <ArrowUpRight size={16} />
            </a>
          </>
        )}
      </div>
    </nav>
  );
}