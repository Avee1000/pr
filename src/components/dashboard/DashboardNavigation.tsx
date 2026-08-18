'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import useMediaQuery from '../global/useMediaQuery';
import { ChevronDown, Hammer, LayoutDashboard, ListTodo, Percent, Plus, Users, WalletCards, SidebarOpen, SidebarClose } from 'lucide-react';
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

const navItems: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/orders/create", label: "Orders", icon: Plus },
    { href: "/dashboard/orders", label: "All Orders", icon: ListTodo },
    {
        label: "Costs Registration",
        icon: WalletCards,
        basePath: "/dashboard/costs",
        children: [
            { href: "/dashboard/costs/materials", label: "Material Costs", icon: Hammer },
            { href: "/dashboard/costs/labor", label: "Labor Costs", icon: Plus },
            { href: "/dashboard/costs/target-profit", label: "Target Profit", icon: Percent },
        ],
    },
];

function isGroup(item: NavItem): item is NavGroup {
    return "children" in item;
}

export default function OrderNavLinks() {
    const pathname = usePathname();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isCostsOpen, setIsCostsOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsCostsOpen(false);
        }
        if (pathname.startsWith('/dashboard/costs')) {
            setIsCostsOpen(true);
        }
    }, [pathname, isOpen]);

    if (isMobile) {
        return null;
    }

    return (
        <aside
            className={`h-auto transition-[width] hidden sm:block duration-300 ease-in-out select-none ${
                isOpen ? 'sm:w-53 lg:w-63' : 'w-16'
            }`}
        >
            <section className="flex flex-col h-full overflow-hidden">
                {/* Toggle Button Container */}
                <div className={`flex items-center w-full h-14 px-3 mb-4 justify-end ${isOpen ? '' : 'justify-center'}`}>
                    <Tooltip show={true} content={isOpen ? 'Collapse' : 'Expand'}>
                        <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => setIsOpen((prev) => !prev)}
                            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                            className="size-10 rounded-xl text-ink dark:text-white hover:bg-muted-foreground/20 transition-colors duration-200 flex items-center justify-center shrink-0 focus:outline-none"
                        >
                            {isOpen ? <SidebarClose className="size-5" /> : <SidebarOpen className="size-5" />}
                        </button>
                    </Tooltip>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden p-2 gap-1.5">
                    <ul className="flex flex-col gap-1.5">
                        {navItems.map((item) => {
                            if (!isGroup(item)) {
                                const isActive = pathname === item.href || 
                                    (item.href === "/dashboard/customers" && pathname.startsWith("/dashboard/customers/edit/")) || 
                                    (item.href === "/dashboard/orders" && pathname.startsWith("/dashboard/orders/board"));
                                const IconComponent = item.icon;

                                return (
                                    <li key={item.href} className="w-full">
                                        <Tooltip show={!isOpen} content={item.label}>
                                            <Link
                                                href={item.href}
                                                aria-current={isActive ? 'page' : undefined}
                                                tabIndex={!isOpen && isMobile ? -1 : 0}
                                                className={`relative flex items-center h-10 px-3 rounded-xl transition-colors duration-200 overflow-hidden ${
                                                    isActive
                                                        ? 'bg-brand text-ink shadow-sm font-medium'
                                                        : 'text-ink dark:text-white hover:bg-muted-foreground/20 hover:text-black'
                                                }`}
                                            >
                                                <div className="absolute left-3.5 flex items-center justify-center size-5 shrink-0">
                                                    <IconComponent className="size-5" />
                                                </div>
                                                <div
                                                    title={item.label}
                                                    aria-label={item.label}
                                                    className={`pl-10 transition-opacity duration-300 whitespace-nowrap text-sm ${
                                                        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
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
                                            aria-expanded={isCostsOpen}
                                            onClick={() => {
                                                if (!isOpen) {
                                                    setIsOpen(true);
                                                    setIsCostsOpen(true);
                                                } else {
                                                    setIsCostsOpen((prev) => !prev);
                                                }
                                            }}
                                            className={`relative flex items-center justify-between h-10 px-3 w-full rounded-xl transition-colors duration-200 overflow-hidden ${
                                                isGroupActive
                                                    ? 'bg-brand text-ink shadow-sm font-medium'
                                                    : 'text-ink dark:text-white hover:bg-muted-foreground/20 hover:text-black'
                                            }`}
                                        >
                                            <div className="absolute left-3.5 flex items-center justify-center size-5 shrink-0">
                                                <ParentIcon className="size-5" />
                                            </div>
                                            <div
                                                title={item.label}
                                                aria-label={item.label}
                                                className={`pl-10 min-w-0 text-ellipsis truncate transition-opacity duration-200 whitespace-nowrap sm:text-sm lg:text-sm ${
                                                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                                                }`}
                                            >
                                                {item.label}
                                            </div>
                                            <div
                                                className={`transition-all duration-200 ${
                                                    isOpen ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                                                }`}
                                            >
                                                <ChevronDown
                                                    className={`size-4 shrink-0 transition-transform duration-300 ${
                                                        isCostsOpen ? 'rotate-180' : ''
                                                    }`}
                                                />
                                            </div>
                                        </button>
                                    </Tooltip>

                                    {/* Submenu Accordion */}
                                    <div
                                        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                                            isCostsOpen && isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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
                                                                tabIndex={!(isCostsOpen && isOpen) ? -1 : 0}
                                                                className={`flex items-center gap-2.5 px-2 py-2 w-full text-xs rounded-lg transition-colors duration-200 whitespace-nowrap ${
                                                                    isChildActive
                                                                        ? 'bg-brand text-ink shadow-sm font-medium'
                                                                        : 'text-ink dark:text-white hover:bg-muted-foreground/20 hover:text-black'
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
                </nav>
            </section>
        </aside>
    );
}