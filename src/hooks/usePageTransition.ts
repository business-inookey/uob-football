import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const navigateWithTransition = useCallback(async (
    href: string, 
    options?: { 
      scroll?: boolean;
      replace?: boolean;
      delay?: number;
    }
  ) => {
    setIsTransitioning(true);
    
    // Add a small delay for smooth transition
    const delay = options?.delay || 150;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (options?.replace) {
      router.replace(href, { scroll: options?.scroll ?? true });
    } else {
      router.push(href, { scroll: options?.scroll ?? true });
    }
    
    // Reset transition state after navigation
    setTimeout(() => setIsTransitioning(false), 100);
  }, [router]);

  const refreshWithTransition = useCallback(async (delay = 150) => {
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    router.refresh();
    setTimeout(() => setIsTransitioning(false), 100);
  }, [router]);

  return {
    isTransitioning,
    navigateWithTransition,
    refreshWithTransition
  };
}
