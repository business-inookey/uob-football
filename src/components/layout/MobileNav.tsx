"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
  { href: "/stopwatch", label: "Stopwatch", icon: "⏱️" },
  { href: "/notes", label: "Notes", icon: "📝" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Show nav for any authenticated user; page-level guards enforce roles
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled) { setIsAuthenticated(!!user); setChecked(true); }
      } catch {
        if (!cancelled) { setIsAuthenticated(false); setChecked(true); }
      }
    })();
    return () => { cancelled = true; };
  }, []);
  
  if (!checked || !isAuthenticated) return null;

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
        <div className="flex gap-2 overflow-x-auto px-2 py-2 text-xs whitespace-nowrap">
          {links.map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-md ${active ? "bg-primary text-primary-foreground" : "text-foreground bg-secondary/50"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}


