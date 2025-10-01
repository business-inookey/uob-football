"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Show nav for any authenticated user; page-level guards enforce roles
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled) { 
          setIsAuthenticated(!!user); 
          setUser(user);
          setChecked(true); 
        }
      } catch {
        if (!cancelled) { setIsAuthenticated(false); setChecked(true); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
        setShowUserMenu(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true);
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    // Immediately update local state to hide the menu
    setIsAuthenticated(false);
    setUser(null);
    setShowUserMenu(false);
    
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, redirect to login
      router.replace('/login');
    }
  };

  // Don't render anything if not checked or not authenticated
  if (!checked || !isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Desktop User Menu */}
      <div className="hidden sm:block fixed top-4 right-20 z-50">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {user?.email || 'User'}
            </span>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-200/50">
                <p className="text-sm font-medium text-gray-900">Signed in as</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
              
              <div className="py-1">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                  <AnimatedThemeToggler />
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile User Menu */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white flex items-center justify-center"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </button>

          {/* Mobile User Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-16 right-0 w-64 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-200/50">
                <p className="text-sm font-medium text-gray-900">Signed in as</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
              
              <div className="py-1">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                  <AnimatedThemeToggler />
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}