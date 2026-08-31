"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/games", label: "Games" },
  { href: "/explore", label: "Explore" },
  { href: "/recommend", label: "Recommend" },
  { href: "/chat", label: "Chat" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-dune/20 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-ink">One Step Closer to Butlerian Jihad</span>
          <div className="hidden gap-3 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm ${
                  pathname === link.href ? "font-medium text-spice" : "text-dune hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} className="text-sm text-dune hover:text-ink">
          Log out
        </button>
      </div>
      <div className="flex gap-3 border-t border-dune/10 px-4 py-2 sm:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm ${
              pathname === link.href ? "font-medium text-spice" : "text-dune"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
