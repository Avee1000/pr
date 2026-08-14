"use client";

import { useState, useEffect } from "react";

export default function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Listener for viewport changes
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    // Clean up listener on unmount
    return () => media.removeEventListener("change", listener);
  }, [query, matches]);

  return matches;
}

export function isMobile() {
  return useMediaQuery("(max-width: 768px)");
}


// import { useState, useEffect } from "react";

// export default function useMediaQuery(query: string) {
//   const [matches, setMatches] = useState(false);

//   useEffect(() => {
//     const media = window.matchMedia(query);
    
//     // Sync initial state on mount
//     setMatches(media.matches);

//     const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
//     media.addEventListener("change", listener);

//     return () => media.removeEventListener("change", listener);
//   }, [query]);

//   return matches;
// }

// export function useIsMobile() {
//   return useMediaQuery("(max-width: 768px)");
// }