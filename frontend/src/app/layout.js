import "./globals.css";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "RentAnything",
  description: "Rent what you need. Share what you own.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        {children}
        <footer className="site-footer"><Link href="/" className="footer-brand">rentanything.</Link><p>A little less owning. A lot more living.</p><Link href="/listings">Find your next thing ↗</Link></footer>
      </body>
    </html>
  );
}