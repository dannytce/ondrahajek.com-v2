import { useState, useEffect, useRef } from 'react';

/** Returns true when nav should be visible (scrolling up or near top), false when hidden (scrolling down). */
export function useScrollDirection(): boolean {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    const SCROLL_THRESHOLD = 40; // Min scroll delta to trigger hide/show (accumulates across frames)
    const TOP_THRESHOLD = 80; // Always show nav when within this many px of top

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      if (!hasScrolledRef.current) {
        hasScrolledRef.current = true;
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY <= TOP_THRESHOLD) {
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollY;
      if (delta > SCROLL_THRESHOLD) {
        setIsVisible(false);
        lastScrollYRef.current = currentScrollY;
      } else if (delta < -SCROLL_THRESHOLD) {
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
      }
      // Only update lastScrollY when we act – else delta keeps accumulating for slow scrolls
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return isVisible;
}
