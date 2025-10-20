import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
