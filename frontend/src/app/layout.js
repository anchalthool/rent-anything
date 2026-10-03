import "./globals.css";
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
      </body>
    </html>
  );
}