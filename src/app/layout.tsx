import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "One Step Closer to Butlerian Jihad",
  description: "Rank board games with your friends and get AI-assisted suggestions on what to play next.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
        <footer className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-dune">
          Game data powered by{" "}
          <a
            href="https://boardgamegeek.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ink"
          >
            BoardGameGeek
          </a>
        </footer>
      </body>
    </html>
  );
}
