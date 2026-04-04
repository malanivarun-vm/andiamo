import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Andiamo — Group Travel, Decided",
  description: "From let's go to it's booked. Without the WhatsApp chaos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface font-sans text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
