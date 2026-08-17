"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

interface HideOnMobileRoutesProps {
  children?: ReactNode;
  ElementToBeShown?: ReactNode;
  ElementToBeHidden?: ReactNode;
  routes?: string[];
  breakpoint?: number;
}

export default function MobileHideWrapper({
  children,
  routes = [],
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

    handleResize(mediaQuery);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, [breakpoint]);

  const isTargetRoute = routes.includes(pathname);

  if (!mounted) {
    if (isTargetRoute) {
      return <div className="max-sm:hidden">{children}</div>;
    }
    return <>{children}</>;
  }

  if (isTargetRoute && isMobile) {
    return null;
  }

  return <>{children}</>;
}

export function OtherMobileNav({ ElementToBeShown, ElementToBeHidden }: HideOnMobileRoutesProps) {
    const pathname = usePathname();
    const isNotDashboardRoute = !pathname.startsWith('/dashboard');
    const isAccountRoute = pathname.startsWith('/account');
    
    // Wrapped in a responsive container to avoid layout double-rendering conflicts
    return (
        <div className="max-sm:block hidden">
            {isNotDashboardRoute && isAccountRoute ? ElementToBeHidden : ElementToBeShown}
        </div>
    );
}