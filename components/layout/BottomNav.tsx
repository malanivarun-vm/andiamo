"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/trips", icon: "card_travel", label: "Trips" },
  { href: "/explore", icon: "explore", label: "Explore" },
  { href: "/inbox", icon: "mail", label: "Inbox" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 rounded-t-3xl"
      style={{
        background: "rgba(251,249,246,0.92)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.04)",
      }}
    >
      {navItems.map(({ href, icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center px-5 py-2 rounded-full transition-all ${
              active ? "text-primary" : "text-outline hover:text-on-surface-variant"
            }`}
            style={active ? { background: "rgba(0,93,167,0.06)" } : undefined}
          >
            <span
              className="material-symbols-outlined mb-1"
              style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
            >
              {icon}
            </span>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-widest">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
