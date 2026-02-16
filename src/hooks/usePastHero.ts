import { useState, useEffect } from 'react';

/** Returns true when the header/hero (90vh) has been scrolled out of view. */
export function usePastHero(): boolean {
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    function check() {
      const heroHeight = window.innerHeight * 0.9;
      setIsPastHero(window.scrollY >= heroHeight);
    }

    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return isPastHero;
}
