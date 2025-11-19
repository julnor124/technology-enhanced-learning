import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technology Enhanced Learning",
  description: "An AI workspace inspired by the latest Figma design",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}

