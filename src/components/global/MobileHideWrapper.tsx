"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

interface HideOnMobileRoutesProps {
  children: ReactNode;
  /** Array of route paths where children should hide on mobile (e.g. ["/login", "/signup"]) */
  routes: string[];
  /** Screen width in pixels to trigger mobile hiding. Defaults to 768. */
  breakpoint?: number;
}

export default function MobileHideWrapper({
  children,
  routes,
  breakpoint = 768,
}: HideOnMobileRoutesProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Initial match check
    handleResize(mediaQuery);

    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, [breakpoint]);

  // Check if current pathname matches any route in the array
  const isTargetRoute = routes.includes(pathname);

  // Before hydration on client, use CSS class hiding to prevent layout flicker
  if (!mounted) {
    if (isTargetRoute) {
      return <div className="max-sm:hidden">{children}</div>;
    }
    return <>{children}</>;
  }

  // If on one of the target routes AND screen is mobile, hide children
  if (isTargetRoute && isMobile) {
    return null;
  }

  return <>{children}</>;
}