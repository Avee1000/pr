'use client'

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import CustomerForm from "./CustomerForm";
import { createCustomer } from "@/lib/customers/action";
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
} from "@/components/ui/drawer"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import useMediaQuery from "@/components/global/useMediaQuery";

export default function AddButton() {
    const [isOpen, setIsOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        let idleTimeout: NodeJS.Timeout;

        const handleScroll = (e: Event) => {
            const currentScrollY = window.scrollY || (e.target as HTMLElement).scrollTop;
            console.log(lastScrollY, currentScrollY, (e.target as HTMLElement).scrollTop)
            if (Math.abs(currentScrollY - lastScrollY) >= 10) {
                if (currentScrollY > lastScrollY) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }
                lastScrollY = currentScrollY;
            }
            resetIdleTimer();
        };

        const handleActivity = () => {
            setIsVisible(true);
            resetIdleTimer();
        };

        const resetIdleTimer = () => {
            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        };

        window.addEventListener("scroll", handleScroll, { capture: true });
        window.addEventListener("click", handleActivity);
        window.addEventListener("touchstart", handleActivity);
        window.addEventListener("pointermove", handleActivity);

        resetIdleTimer();

        // Clean up everything properly
        return () => {
            window.removeEventListener("scroll", handleScroll, { capture: true });
            window.removeEventListener("click", handleActivity);
            window.removeEventListener("touchstart", handleActivity);
            window.removeEventListener("pointermove", handleActivity);
            clearTimeout(idleTimeout);
        };
    }, []);

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen} showSwipeHandle>
            <div className="self-center">
                <Button
                    onClick={() => setIsOpen(true)}
                    className={`
                        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"} 
                        sm:hidden 
                        hover:-translate-y-2 
                        transition-all duration-300 
                        size-12.5 rounded-full my-5 
                        fixed bottom-0 left-1/2 -translate-x-1/2 
                        z-10
                    `}
                >
                    <Plus className="size-5" />
                </Button>
            </div>
            <DrawerContent className={'py-5 max-h-[90%] h-auto'}>
                <CustomerForm action={createCustomer} onSuccess={() => setIsOpen(false)} />
                <DrawerFooter>
                    <Button variant={"outline"} onClick={() => setIsOpen((prev) => !prev)}>Cancel</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer >
    )
}