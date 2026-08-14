'use client'

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';

export default function NavPopUp() {
    const [isLoggedIn] = useState(true);//to be used when settingup user authenticaion
    const [isOpen, setIsOpen] = useState(false);

    // Create a ref for the menu container
    const menuRef = useRef<HTMLDivElement>(null);

    // Toggle function
    const handleToggle = () => setIsOpen((prev) => !prev);

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        // Only add event listener when menu is open
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className='relative m-2' ref={menuRef}>
            {/* Click avatar to toggle */}
            <Avatar onClick={handleToggle} className='cursor-pointer size-10'>
                <AvatarFallback>FL</AvatarFallback>
            </Avatar>

            {/* Conditionally render the nav menu */}
            {isOpen && (
                <nav aria-label="Primary" className='bg-white absolute right-0 mt-2 rounded-lg py-2 shadow-md border border-border w-48 z-5'>
                    <ul className="flex flex-col gap-1 text-sm text-black text-left items-start w-auto">
                        {[
                            { href: '/', label: 'Home' },
                            { href: '/account', label: 'Account' },
                            { href: '/dashboard', label: 'Dashboard' },
                            { href: '/tracker', label: 'Tracker' },
                            { href: '/about', label: 'About' }
                        ].filter(item => item.href !== '/dashboard' && item.href !== '/account' || isLoggedIn)
                            .map((item) => (
                                <li key={item.href} className='px-2 w-full'>
                                    <Link
                                        href={item.href}
                                        className="block rounded-md py-2 px-1 text-sm text-ink transition hover:bg-muted"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        {isLoggedIn && (
                            <div className="flex flex-col w-full">
                                <span className='border-border w-full border-t my-2'></span>
                                <Button className='cursor-pointer bg-action my-0 mx-auto'>Log out</Button>
                            </div>
                        )}
                        {!isLoggedIn && (
                            <div className="flex flex-col w-full">
                                <span className='border-border w-full border-t my-2'></span>
                                <Button className='cursor-pointer bg-action my-0 mx-auto'>Log in</Button>
                            </div>
                        )}
                    </ul>
                </nav>
            )}
        </div>
    );
}