"use client";
import { useEffect, useState } from "react";

export function UseMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);

    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
