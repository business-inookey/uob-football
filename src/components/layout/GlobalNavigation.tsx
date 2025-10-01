"use client";
import React, { useEffect, useState } from 'react';
import { NavToggle } from '@/components/ui/NavToggle';
import { NavigationMenu } from '@/components/layout/NavigationMenu';
import { useNavigation } from '@/contexts/NavigationContext';
import { createClient } from '@/lib/supabase/client';

export function GlobalNavigation() {
  const { isNavOpen, toggleNav, closeNav } = useNavigation();
  const [checked, setChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled) { 
          setIsAuthenticated(!!user); 
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
        closeNav(); // Close navigation when user logs out
      } else if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [closeNav]);

  // Don't render anything if not checked or not authenticated
  if (!checked || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <NavToggle isOpen={isNavOpen} onToggle={toggleNav} />
      <NavigationMenu isOpen={isNavOpen} onClose={closeNav} />
    </>
  );
}

export default GlobalNavigation;
