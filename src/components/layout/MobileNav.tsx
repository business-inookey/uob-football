"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/players", label: "Players", icon: "👥" },
  { href: "/stats", label: "Stats", icon: "📊" },
  { href: "/attendance", label: "Attendance", icon: "📅" },
  { href: "/compare", label: "Compare", icon: "⚖️" },
  { href: "/best-xi", label: "Best XI", icon: "⭐" },
  { href: "/weights", label: "Weights", icon: "⚖️" },
  { href: "/games", label: "Games", icon: "⚽" },
  { href: "/video", label: "Video", icon: "🎥" },
];

export default function MobileNav() {
  const pathname = usePathname();
  
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden sm:block border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">UoB</span>
                </div>
                <span className="font-semibold text-lg text-foreground">GameLens</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              {links.map((link) => {
                const active = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    <span className="hidden md:inline">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu Placeholder */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-secondary-foreground text-sm font-medium">👤</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 inset-x-0 border-t bg-background sm:hidden">
        <ul className="grid grid-cols-5 text-xs">
          {links.slice(0,5).map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <li key={l.href} className="text-center">
                <Link
                  href={l.href}
                  className={`block py-3 ${active ? "text-primary font-medium" : "text-foreground"}`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}


