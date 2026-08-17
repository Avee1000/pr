'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

type TooltipProps = {
    content: string;
    show: boolean;
    children: ReactNode;
};

export function Tooltip({ content, show, children }: TooltipProps) {
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const [mounted, setMounted] = useState(false);
    const targetRef = useRef<HTMLDivElement>(null);

    // Prevent SSR hydration mismatch for portals
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMouseEnter = () => {
        if (!show) return;
        if (targetRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top + rect.height / 2,
                left: rect.right + 10,
            });
        }
    };

    const handleMouseLeave = () => {
        setCoords(null);
    };

    return (
        <div
            ref={targetRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="w-auto"
        >
            {children}
            {coords && mounted &&
                createPortal(
                    <div
                        style={{
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            transform: 'translateY(-50%)',
                        }}
                        className={`fixed z-50 px-2.5 py-1.5 text-xs text-white bg-neutral-900 dark:bg-gray-200 dark:text-ink rounded-md shadow-lg whitespace-nowrap transition-all duration-300 scale-0 pointer-events-none ${show ? 'scale-100 pointer-events-auto' : ''
                            }}`}
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </div>
    );
}