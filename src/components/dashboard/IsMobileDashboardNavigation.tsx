'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import useMediaQuery from '../global/useMediaQuery';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ChevronDown, Hammer, LayoutDashboard, ListTodo, Percent, Plus, Users, WalletCards, Menu } from 'lucide-react';

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

export default function isMobileOrderNavLinks() {
    const pathname = usePathname();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isCostsOpen, setIsCostsOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        if (pathname.startsWith('/dashboard/costs')) {
            setIsCostsOpen(true);
        }
    }, [pathname]);

    if (isMobile) {
        return (
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger showChevron={false}><Menu className="size-5" /></NavigationMenuTrigger>
                        <NavigationMenuContent className="bg-[#1A1A1A] text-white rounded-xl">
                            <ul className="grid w-80 gap-2 p-2 md:w-125 md:grid-cols-2">
                                {navItems.map((item) => {
                                    if (!isGroup(item)) {
                                        const isActive = pathname === item.href || (item.href === "/dashboard/customers" && pathname.startsWith("/dashboard/customers/edit/"));
                                        const IconComponent = item.icon;
                                        return (
                                            <li key={item.href} className="w-full">
                                                <Link
                                                    href={item.href}
                                                    aria-current={isActive ? 'page' : undefined}
                                                    className={`flex items-center gap-3 px-4 py-3 w-full text-sm rounded-xl transition-colors duration-200 ${isActive ? 'bg-button-bg text-[#1A1A1A] shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    <IconComponent className="size-5 shrink-0" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    }

                                    const ParentIcon = item.icon;
                                    const isGroupActive = pathname.startsWith(item.basePath);

                                    return (
                                        <li key={item.basePath} className="w-full md:col-span-2">
                                            <button
                                                type="button"
                                                aria-expanded={isCostsOpen}
                                                onClick={() => setIsCostsOpen((prev) => !prev)}
                                                className={`flex items-center justify-between gap-3 px-4 py-3 w-full text-sm rounded-xl transition-colors duration-200 ${isGroupActive ? 'bg-button-bg text-[#1A1A1A] shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <span className="flex items-center gap-3 min-w-0 truncate">
                                                    <ParentIcon className="size-5 shrink-0" />
                                                    <span className="truncate">{item.label}</span>
                                                </span>
                                                <ChevronDown className={`size-4 shrink-0 transition-transform duration-200 ${isCostsOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {isCostsOpen && (
                                                <ul className="mt-1 flex flex-col gap-1 pl-4 border-l border-white/10 ml-4">
                                                    {item.children.map((child) => {
                                                        const ChildIcon = child.icon;
                                                        const isChildActive = pathname === child.href;
                                                        return (
                                                            <li key={child.href} className="w-full">
                                                                <Link
                                                                    href={child.href}
                                                                    aria-current={isChildActive ? 'page' : undefined}
                                                                    className={`flex items-center gap-3 px-4 py-2.5 w-full text-sm rounded-xl transition-colors duration-200 ${isChildActive ? 'bg-button-bg text-[#1A1A1A] shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                                        }`}
                                                                >
                                                                    <ChildIcon className="size-4 shrink-0" />
                                                                    <span>{child.label}</span>
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        );
    }
}