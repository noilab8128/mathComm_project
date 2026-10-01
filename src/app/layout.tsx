
// Import Next.js types and Google Fonts
import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

// Configure Geist Sans font for body text and headings
const geistSans = Geist({
  variable: "--font-geist-sans", // CSS variable name for Tailwind CSS
  subsets: ["latin"], // Only load Latin character subset
});

// Configure Geist Mono font for code blocks and monospace text
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // CSS variable name for Tailwind CSS
  subsets: ["latin"], // Only load Latin character subset
});

// Serif for problem statements (Tailwind `font-serif`)
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

// SEO metadata for the application
export const metadata: Metadata = {
  title: "MathQuest", // Page title shown in browser tab
  description: "An interactive and engaging math learning platform", // Meta description for search engines
};

// Root layout component that wraps all pages
export default function RootLayout({
  children, // All page content will be passed as children
}: Readonly<{
  children: React.ReactNode; // TypeScript type for React children
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
