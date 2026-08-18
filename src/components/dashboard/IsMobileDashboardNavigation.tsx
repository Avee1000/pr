'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import useMediaQuery from '../global/useMediaQuery';
import {
    ChevronDown,
    Hammer,
    LayoutDashboard,
    ListTodo,
    Percent,
    Plus,
    Users,
    WalletCards,
    Menu,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import StaggerReveal from "@/components/global/StaggerReveal";

interface NavigationArg {
    showBlockButton?: Boolean | null;
}

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

export default function IsMobileOrderNavLinks({ showBlockButton }: NavigationArg) {
    const pathname = usePathname();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isCostsOpen, setIsCostsOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Automatically expand the group dropdown if on a matching sub-route
    useEffect(() => {
        if (!isOpen) {
            setIsCostsOpen(false);
        }
        if (pathname.startsWith('/dashboard/costs')) {
            setIsCostsOpen(true);
        }
    }, [pathname, isOpen]);

    // Close drawer automatically when navigating to a new link
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
                    className={`${showBlockButton ? 'w-full h-11 rounded-xl bg-ink dark:bg-white text-white dark:text-ink hover:bg-ink hover:text-white dark:hover:bg-gray-200' : 'size-10 rounded-xl text-ink dark:text-white hover:bg-muted-foreground/20'}`}
                    aria-label="Open Dashboard Navigation"
                >
                    {showBlockButton ? "Open Dashboard Navigation" : (
                        <Menu className="size-5" />
                    )}
                </Button>
            }>
            </DrawerTrigger>
            <DrawerContent className="max-h-[95%] h-auto">
                <DrawerHeader className="text-left">
                    <DrawerTitle>Dashboard Navigation</DrawerTitle>
                    <DrawerDescription>Access your overview, Customers, orders, and cost settings.</DrawerDescription>
                </DrawerHeader>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col gap-6 overflow-y-auto px-4 py-2 mt-3">
                    <StaggerReveal
                        isOpen={isOpen}
                        position="bottom"
                        className="flex flex-col gap-1.5 mt-4"
                    >
                        {navItems.map((item) => {
                            if (!isGroup(item)) {
                                const isActive = pathname === item.href || (item.href === "/dashboard/customers" && pathname.startsWith("/dashboard/customers/edit/"));
                                const IconComponent = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`relative flex items-center h-11 px-3 rounded-xl transition-colors duration-200 ${isActive
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
                                        aria-expanded={isCostsOpen}
                                        onClick={() => setIsCostsOpen((prev) => !prev)}
                                        className={`relative flex items-center justify-between h-11 px-3 w-full rounded-xl transition-colors duration-200 ${isGroupActive
                                            ? 'bg-brand text-ink shadow-sm font-medium'
                                            : 'hover:bg-muted-foreground/20 hover:text-black dark:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <ParentIcon className="size-5 shrink-0" />
                                            <span className="text-sm">{item.label}</span>
                                        </div>
                                        <ChevronDown
                                            className={`size-4 shrink-0 transition-transform duration-300 ${isCostsOpen ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {/* Submenu Accordion Animation */}
                                    <div
                                        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isCostsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
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
                                                            tabIndex={!isCostsOpen ? -1 : 0}
                                                            className={`flex items-center gap-2.5 px-3 py-2.5 w-full rounded-lg transition-colors duration-200 ${isChildActive
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
                </nav>

                <DrawerFooter>
                    <DrawerClose render={
                        <Button variant="outline" className="w-full rounded-xl h-11">Close</Button>
                    }>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}