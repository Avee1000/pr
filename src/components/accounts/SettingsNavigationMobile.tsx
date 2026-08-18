'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import useMediaQuery from '../global/useMediaQuery';
import {
    ChevronDown,
    User,
    Building2,
    Sliders,
    ShieldCheck,
    Bell,
    CreditCard,
    Percent,
    Clock,
    Logs,
    Menu,
} from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import StaggerReveal from "@/components/global/StaggerReveal";
import IsMobileOrderNavLinks from '../dashboard/IsMobileDashboardNavigation';

type NavLeaf = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    basePath: string;
    children: NavLeaf[];
};

type NavItem = NavLeaf | NavGroup;

type NavSection = {
    title: string;
    items: NavItem[];
};

const settingsNavSections: NavSection[] = [
    {
        title: 'Settings',
        items: [
            { href: '/dashboard/settings/business', label: 'Business Details', icon: Building2 },
            {
                label: 'Pricing Defaults',
                icon: Sliders,
                basePath: '/dashboard/settings/pricing',
                children: [
                    { href: '/dashboard/settings/pricing/labor-rate', label: 'Hourly & Labor Rates', icon: Clock },
                    { href: '/dashboard/settings/pricing/margins', label: 'Target Margins', icon: Percent },
                    { href: '/dashboard/settings/pricing/billing', label: 'Payment Terms', icon: CreditCard },
                ],
            },
        ],
    },
    {
        title: 'My Account',
        items: [
            { href: '/account/profile', label: 'Account Profile', icon: User },
            { href: '/account/audit-trail', label: 'Audit Trail', icon: Logs },
            { href: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell },
            { href: '/dashboard/settings/security', label: 'Security & Auth', icon: ShieldCheck },
        ],
    },
];

function isGroup(item: NavItem): item is NavGroup {
    return 'children' in item;
}

export default function SettingsNavLinksMobile() {
    const pathname = usePathname();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isPricingOpen, setIsPricingOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Automatically expand the group dropdown if on a matching sub-route
    useEffect(() => {
        if (!isOpen) {
            setIsPricingOpen(false);
        }
        if (pathname.startsWith('/dashboard/settings/pricing')) {
            setIsPricingOpen(true);
        }
    }, [pathname, isOpen]);

    // Close drawer automatically when navigating to a new link on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    if (!isMobile) {
        return null;
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen} showSwipeHandle>
            <DrawerTrigger render={
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-xl text-ink dark:text-white hover:bg-muted-foreground/20"
                    aria-label="Open Navigation Menu"
                >
                    <Menu className="size-5" />
                </Button>
            }>
            </DrawerTrigger>
            <DrawerContent className="max-h-[95%] h-auto">
                <DrawerHeader className="text-left">
                    <DrawerTitle>Navigation Menu</DrawerTitle>
                    <DrawerDescription>Access your account and system settings.</DrawerDescription>
                </DrawerHeader>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col gap-6 overflow-y-auto px-4 py-2 mt-5">
                    {settingsNavSections.map((section) => (
                        <div key={section.title} className="flex flex-col gap-1.5">
                            <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {section.title}
                            </div>
                            <StaggerReveal
                                isOpen={isOpen}
                                position="bottom"
                                className="flex flex-col gap-1.5"
                            >
                                {section.items.map((item) => {
                                    if (!isGroup(item)) {
                                        const isActive = pathname === item.href;
                                        const IconComponent = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                aria-current={isActive ? 'page' : undefined}
                                                className={`relative flex items-center h-11 px-3 rounded-xl transition-colors duration-200 ${
                                                    isActive
                                                        ? 'bg-brand text-ink shadow-sm font-medium'
                                                        : 'dark:text-white hover:bg-muted-foreground/20 hover:text-black'
                                                }`}
                                            >
                                                <div className="flex items-center justify-center size-5 shrink-0 mr-3">
                                                    <IconComponent className="size-5" />
                                                </div>
                                                <span className="text-sm">{item.label}</span>
                                            </Link>
                                        );
                                    }

                                    const ParentIcon = item.icon;
                                    const isGroupActive = pathname.startsWith(item.basePath);

                                    return (
                                        <div key={item.basePath} className="w-full">
                                            <button
                                                type="button"
                                                aria-expanded={isPricingOpen}
                                                onClick={() => setIsPricingOpen((prev) => !prev)}
                                                className={`relative flex items-center justify-between h-11 px-3 w-full rounded-xl transition-colors duration-200 ${
                                                    isGroupActive
                                                        ? 'bg-brand text-ink shadow-sm font-medium'
                                                        : 'hover:bg-muted-foreground/20 hover:text-black dark:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ParentIcon className="size-5 shrink-0" />
                                                    <span className="text-sm">{item.label}</span>
                                                </div>
                                                <ChevronDown
                                                    className={`size-4 shrink-0 transition-transform duration-300 ${
                                                        isPricingOpen ? 'rotate-180' : ''
                                                    }`}
                                                />
                                            </button>

                                            {/* Submenu Accordion */}
                                            <div
                                                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                                                    isPricingOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                                }`}
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="mt-1 flex flex-col gap-1 pl-4 border-l border-muted-foreground/20 ml-4">
                                                        {item.children.map((child) => {
                                                            const isChildActive = pathname === child.href;
                                                            const ChildIcon = child.icon;
                                                            return (
                                                                <Link
                                                                    key={child.href}
                                                                    href={child.href}
                                                                    aria-current={isChildActive ? 'page' : undefined}
                                                                    tabIndex={!isPricingOpen ? -1 : 0}
                                                                    className={`flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl transition-colors duration-200 ${
                                                                        isChildActive
                                                                            ? 'bg-brand text-ink shadow-sm font-medium'
                                                                            : 'hover:bg-muted-foreground/20 hover:text-black dark:text-white'
                                                                    }`}
                                                                >
                                                                    <ChildIcon className="size-4 shrink-0" />
                                                                    <span>{child.label}</span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </StaggerReveal>
                        </div>
                    ))}
                </nav>

                <DrawerFooter>
                    <IsMobileOrderNavLinks showBlockButton={true}/>
                    <DrawerClose render={
                        <Button variant="outline" className="w-full h-10 rounded-xl">Close</Button>
                    }>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}