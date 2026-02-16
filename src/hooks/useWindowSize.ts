// https://dev.to/vitaliemaldur/resize-event-listener-using-react-hooks-1k0c
import { useState, useEffect } from 'react';

export function useWindowSize(): number | undefined {
  const [windowSize, setWindowSize] = useState<number | undefined>(undefined);

  useEffect(() => {
    function handleResize() {
      setWindowSize(window.innerWidth);
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}
