'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    SidebarOpen,
    SidebarClose,
    CreditCard,
    Percent,
    Clock,
    ArrowLeft,
    Logs,
} from 'lucide-react';
import { Tooltip } from '../global/Tooltip';

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

export default function SettingsNavLinks() {
    const pathname = usePathname();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isPricingOpen, setIsPricingOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    // Automatically expand the group dropdown if on a matching sub-route
    useEffect(() => {
        if (!isOpen) {
            setIsPricingOpen(false);
        }
        if (pathname.startsWith('/dashboard/settings/pricing')) {
            setIsPricingOpen(true);
        }
    }, [pathname, isOpen]);

    return (
        <aside
            className={`h-auto transition-[width] duration-300 ease-in-out select-none ${isOpen ? 'sm:w-53 lg:w-63' : 'w-16'
                }`}
        >
            <section className="flex flex-col h-full overflow-hidden">
                <div
                    className={`flex items-center w-full h-14 px-3 mb-4 ${isOpen ? 'justify-between' : 'justify-end'
                        }`}
                >

                    {isOpen && (
                        <button
                            title='Back to Workspace'
                            type="button"
                            onClick={() => router.back()}
                            aria-label="Go back"
                            className="size-10 rounded-xl text-ink dark:text-white hover:bg-muted-foreground/20 transition-all duration-200 flex items-center justify-center shrink-0 focus:outline-none"
                        >
                            <ArrowLeft className="size-5" />
                        </button>
                    )}
                    <Tooltip show={true} content={isOpen ? 'Collapse' : 'Expand'}>

                        <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => setIsOpen((prev) => !prev)}
                            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                            className="relative size-10 rounded-xl text-ink dark:text-white hover:bg-muted-foreground/20 transition-colors duration-200 flex items-center justify-center shrink-0 focus:outline-none"
                        >
                            {isOpen ? <SidebarClose className="size-5" /> : <SidebarOpen className="size-5" />}
                        </button>
                    </Tooltip>

                </div>

                {/* Navigation Items */}
                <nav className={`flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden p-2 ${isOpen ? 'gap-10' : 'gap-0'}`}>
                    {settingsNavSections.map((section) => (
                        <div key={section.title} className="flex flex-col gap-1.5">
                            {/* Section Heading */}
                            <Tooltip
                                show={isOpen}
                                content={section.title}
                            >
                                <div
                                    className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mb-1' : 'grid-rows-[0fr] opacity-0 mb-0'
                                        }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                            {section.title}
                                        </div>
                                    </div>
                                </div>
                            </Tooltip>
                            <ul className="flex flex-col gap-1.5">
                                {section.items.map((item) => {
                                    if (!isGroup(item)) {
                                        const isActive = pathname === item.href;
                                        const IconComponent = item.icon;
                                        return (
                                            <li key={item.href} className="w-full">
                                                <Tooltip show={!isOpen} content={item.label}>
                                                    <Link
                                                        href={item.href}
                                                        // title={!isOpen ? item.label : undefined}
                                                        aria-current={isActive ? 'page' : undefined}
                                                        tabIndex={!isOpen && isMobile ? -1 : 0}
                                                        className={`relative flex items-center text-ink h-10 px-3 rounded-xl transition-colors duration-200 overflow-hidden ${isActive
                                                            ? 'bg-brand text-ink shadow-sm font-medium'
                                                            : 'dark:text-white hover:bg-muted-foreground/20 hover:text-black'
                                                            }`}
                                                    >
                                                        <div className="absolute left-3.5 flex items-center justify-center size-5 shrink-0">
                                                            <IconComponent className="size-5" />
                                                        </div>
                                                        <div
                                                            title={item.label}
                                                            aria-label={item.label}
                                                            className={`pl-10 transition-opacity duration-300 whitespace-nowrap text-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                                }`}
                                                        >
                                                            {item.label}
                                                        </div>
                                                    </Link>
                                                </Tooltip>
                                            </li>
                                        );
                                    }

                                    const ParentIcon = item.icon;
                                    const isGroupActive = pathname.startsWith(item.basePath);

                                    return (
                                        <li key={item.basePath} className="w-full">
                                            <Tooltip show={!isOpen} content={item.label}>
                                                <button
                                                    type="button"
                                                    // title={!isOpen ? item.label : undefined}
                                                    aria-expanded={isPricingOpen}
                                                    onClick={() => {
                                                        if (!isOpen) {
                                                            setIsOpen(true);
                                                            setIsPricingOpen(true);
                                                        } else {
                                                            setIsPricingOpen((prev) => !prev);
                                                        }
                                                    }}
                                                    className={`relative flex items-center justify-between h-10 px-3 w-full rounded-xl transition-colors duration-200 overflow-hidden ${isGroupActive
                                                        ? 'bg-brand text-ink shadow-sm font-medium'
                                                        : 'hover:bg-muted-foreground/20 hover:text-black dark:text-white'
                                                        }`}
                                                >
                                                    <div className="absolute left-3.5 flex items-center justify-center size-5 shrink-0">
                                                        <ParentIcon className="size-5" />
                                                    </div>
                                                    <div
                                                        title={item.label}
                                                        aria-label={item.label}
                                                        className={`pl-10 min-w-0 text-ellipsis truncate transition-opacity duration-200 whitespace-nowrap sm:text-sm lg:text-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                            }`}
                                                    >
                                                        {item.label}
                                                    </div>
                                                    <div
                                                        className={`transition-all duration-200 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
                                                            }`}
                                                    >
                                                        <ChevronDown
                                                            className={`size-4 shrink-0 transition-transform duration-300 ${isPricingOpen ? 'rotate-180' : ''
                                                                }`}
                                                        />
                                                    </div>
                                                </button>
                                            </Tooltip>

                                            {/* Submenu Accordion */}
                                            <div
                                                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isPricingOpen && isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                                    }`}
                                            >
                                                <div className="overflow-hidden">
                                                    <ul className="mt-1 flex flex-col gap-1 pl-1 border-l border-white/10 ml-2.5">
                                                        {item.children.map((child) => {
                                                            const isChildActive = pathname === child.href;
                                                            const ChildIcon = child.icon;
                                                            return (
                                                                <li key={child.href} className="w-full">
                                                                    <Link
                                                                        href={child.href}
                                                                        aria-current={isChildActive ? 'page' : undefined}
                                                                        tabIndex={!(isPricingOpen && isOpen) ? -1 : 0}
                                                                        className={`flex items-center gap-2.5 px-2 py-2 w-full text-xs rounded-lg transition-colors duration-200 whitespace-nowrap ${isChildActive
                                                                            ? 'bg-brand text-ink shadow-sm font-medium'
                                                                            : 'hover:bg-muted-foreground/20 hover:text-black dark:text-white'
                                                                            }`}
                                                                    >
                                                                        <ChildIcon className="size-4 shrink-0" />
                                                                        <span>{child.label}</span>
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </section>
        </aside>
    );
}