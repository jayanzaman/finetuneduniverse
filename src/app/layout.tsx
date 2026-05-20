import type { Metadata } from "next";
import { Unbounded, Space_Grotesk, Space_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-unbounded",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Our Finetuned Universe - Interactive Cosmic Exploration",
  description: "Explore the improbable conditions that allow complexity to emerge in our cosmos. Discover how the fundamental parameters of reality appear precisely calibrated for the existence of stars, planets, and life itself.",
  keywords: "cosmology, fine-tuning, universe, physics, interactive, education, cosmic parameters, big bang, stellar formation",
  authors: [{ name: "Jayan Zaman" }],
  openGraph: {
    title: "Our Finetuned Universe",
    description: "An interactive exploration of cosmic fine-tuning and the remarkable precision required for complexity to emerge",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${unbounded.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${newsreader.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
