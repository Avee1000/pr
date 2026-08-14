'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import useMediaQuery from '../useMediaQuery';
import { ChevronDown, Hammer, LayoutDashboard, ListTodo, Percent, Plus, Users, WalletCards, SidebarOpen, SidebarClose } from 'lucide-react';

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
        if (pathname.startsWith('/dashboard/costs')) {
            setIsCostsOpen(true);
        }
    }, [pathname]);

    if (isMobile) {
        return 
    }

    return (
        <aside
            className={`h-auto transition-[width] duration-300 ease-in-out select-none pt-1 pl-1 pb-1  ${
                isOpen ? "sm:w-50 lg:w-64" : "w-16"
            }`}
        >
            <section
                style={{ backgroundColor: "#1A1A1A" }}
                className="flex flex-col h-full rounded-md text-white shadow-md overflow-hidden"
            >
                {/* Toggle Button */}
                <div className={`flex items-center justify-end h-14 px-2.5 border-b border-muted-foreground/50`}>
                    <button
                        onClick={() => setIsOpen((prev) => !prev)}
                        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                        className="relative size-10 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors duration-200 flex items-center justify-center shrink-0 focus:outline-none"
                    >
                        {isOpen ? <SidebarClose className="size-5" /> : <SidebarOpen className="size-5" />}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2">
                    <ul className="flex flex-col gap-1.5">
                        {navItems.map((item) => {
                            if (!isGroup(item)) {
                                const isActive = pathname === item.href || (item.href === "/dashboard/customers" && pathname.startsWith("/dashboard/customers/edit/") || (item.href === "/dashboard/orders" && pathname.startsWith("/dashboard/orders/board")));
                                const IconComponent = item.icon;
                                return (
                                    <li key={item.href} className="w-full">
                                        <Link
                                            href={item.href}
                                            title={!isOpen ? item.label : undefined}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={`relative flex items-center h-11 px-3 rounded-xl transition-colors duration-200 overflow-hidden ${
                                                isActive
                                                    ? 'bg-button-bg text-[#1A1A1A] shadow-sm'
                                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <div className="absolute left-3 flex items-center justify-center size-5 shrink-0">
                                                <IconComponent className="size-5" />
                                            </div>
                                            <div
                                                className={`pl-8 transition-opacity duration-200 whitespace-nowrap text-sm  ${
                                                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                                                }`}
                                            >
                                                {item.label}
                                            </div>
                                        </Link>
                                    </li>
                                );
                            }

                            const ParentIcon = item.icon;
                            const isGroupActive = pathname.startsWith(item.basePath);

                            return (
                                <li key={item.basePath} className="w-full">
                                    <button
                                        type="button"
                                        title={!isOpen ? item.label : undefined}
                                        aria-expanded={isCostsOpen}
                                        onClick={() => {
                                            if (!isOpen) {
                                                setIsOpen(true);
                                                setIsCostsOpen(true);
                                            } else {
                                                setIsCostsOpen((prev) => !prev);
                                            }
                                        }}
                                        className={`relative flex items-center justify-between h-11 px-3 w-full rounded-xl transition-colors duration-200 overflow-hidden ${
                                            isGroupActive
                                                ? 'bg-button-bg text-[#1A1A1A] shadow-sm'
                                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <div className="absolute left-3 flex items-center justify-center size-5 shrink-0">
                                            <ParentIcon className="size-5" />
                                        </div>
                                        <div
                                            className={`pl-8 min-w-0 text-ellipsis truncate transition-opacity duration-200 whitespace-nowrap sm:text-xs lg:text-sm ${
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

                                    {/* Submenu Accordion */}
                                    <div
                                        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                                            isCostsOpen && isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                        }`}
                                    >
                                        <div className="overflow-hidden">
                                            <ul className="mt-1 flex flex-col gap-1 pl-3 border-l border-white/10 ml-5">
                                                {item.children.map((child) => {
                                                    const isChildActive = pathname === child.href;
                                                    const ChildIcon = child.icon;
                                                    return (
                                                        <li key={child.href} className="w-full">
                                                            <Link
                                                                href={child.href}
                                                                aria-current={isChildActive ? 'page' : undefined}
                                                                className={`flex items-center gap-2.5 px-3 py-2 w-full text-xs rounded-lg transition-colors duration-200 whitespace-nowrap ${
                                                                    isChildActive
                                                                        ? 'bg-button-bg text-[#1A1A1A] shadow-sm'
                                                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
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