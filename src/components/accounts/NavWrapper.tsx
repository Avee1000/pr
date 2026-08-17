"use client";

import SettingsNavLinksMobile from './SettingsNavigationMobile';
import SettingsNavLinks from './SettingsNavigation';
import useMediaQuery  from '@/components/global/useMediaQuery';


export default function NavWrapper() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <div>
        <SettingsNavLinksMobile />
      </div>
    );
  }

  return <SettingsNavLinks />;
}