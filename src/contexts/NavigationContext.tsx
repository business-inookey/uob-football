"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  isNavOpen: boolean;
  toggleNav: () => void;
  closeNav: () => void;
  openNav: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(prev => !prev);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  const openNav = () => {
    setIsNavOpen(true);
  };

  // Close nav on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsNavOpen(false);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Close nav on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNavOpen) {
        closeNav();
      }
    };

    if (isNavOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when nav is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isNavOpen]);

  return (
    <NavigationContext.Provider value={{
      isNavOpen,
      toggleNav,
      closeNav,
      openNav
    }}>
      {children}
    </NavigationContext.Provider>
  );
}
