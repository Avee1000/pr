"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getTestimonials } from "@/lib/testimonials/action";
import { Testimonial } from "@/lib/types/dashBoardTypes";

async function fetchTestimonials(locale: string): Promise<Testimonial[]> {
    try {
        const testimonials = await getTestimonials(locale);
        return testimonials as Testimonial[];
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        return [];
    }
}

export function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadTestimonials = async () => {
            const fetchedTestimonials = await fetchTestimonials("en");
            setTestimonials(fetchedTestimonials);
        };

        loadTestimonials();
    }, []);

    // Silk-Smooth Inertia Wheel-to-Horizontal Scroll
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let targetScrollLeft = container.scrollLeft;
        let animationFrameId: number | null = null;

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY === 0) return;
            e.preventDefault();

            targetScrollLeft += e.deltaY;

            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));

            if (!animationFrameId) {
                const smoothScrollStep = () => {
                    const currentScrollLeft = container.scrollLeft;
                    const distance = targetScrollLeft - currentScrollLeft;

                    if (Math.abs(distance) < 0.5) {
                        container.scrollLeft = targetScrollLeft;
                        animationFrameId = null;
                        return;
                    }

                    container.scrollLeft += distance * 0.15;
                    animationFrameId = requestAnimationFrame(smoothScrollStep);
                };

                animationFrameId = requestAnimationFrame(smoothScrollStep);
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => {
            container.removeEventListener("wheel", handleWheel);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Helper function for button-triggered scrolling
    const scroll = (direction: "left" | "right") => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = 300; 
        const targetScrollLeft =
            direction === "left"
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: targetScrollLeft,
            behavior: "smooth",
        });
    };

    if (!testimonials.length) {
        return null;
    }

    return (
        <section className="relative w-full border-t border-zinc-200/80 dark:border-zinc-800/80 dark:bg-ink py-28 overflow-hidden transition-colors">
            {/* Subtle Enterprise Backdrop Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-md bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-300/50 dark:border-zinc-700/50 px-3 py-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 mb-4 tracking-wide uppercase">
                            <ShieldCheck className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                            Verified Enterprise Social Proof
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink dark:text-white">
                            Trusted by industry professionals worldwide
                        </h2>
                        <p className="text-base text-muted-foreground dark:text-zinc-400 mt-3 font-normal leading-relaxed">
                            Discover how top-tier freelancers and modern businesses scale operations, optimize pricing workflows, and secure steady cash flow.
                        </p>
                    </div>

                    {/* Navigation Buttons and Hint */}
                    <div className="flex max-lg:flex-col items-center gap-4 self-start md:self-end pb-2">
                        <div className="lg:flex items-center gap-2 text-xs font-medium text-muted-foreground dark:text-zinc-500 uppercase tracking-widest">
                            <span>Scroll or Drag</span>
                            <div className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => scroll("left")}
                                aria-label="Scroll left"
                                className="flex h-10 w-10 items-center justify-center rounded-md border border-ink bg-brand text-ink transition-all cursor-pointer hover:-translate-y-1  duration-300 ease-in-out"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                onClick={() => scroll("right")}
                                aria-label="Scroll right"
                                className="flex h-10 w-10 items-center justify-center rounded-md border border-ink bg-brand text-ink transition-all cursor-pointer hover:-translate-y-1  duration-300 ease-in-out"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex w-full overflow-x-auto pb-6 pt-2 scrollbar-none scroll-fade-x [-ms-overflow-style:none] cursor-grab active:cursor-grabbing"
                >
                    <div className="flex gap-6 min-w-max mx-auto px-2">
                        {testimonials.map((item) => (
                            <Card
                                key={item.id}
                                className="w-90 sm:w-100 shrink-0 rounded-lg border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-2xs text-left flex flex-col justify-between transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-600 relative overflow-hidden group"
                            >
                                <CardContent className="p-8 flex flex-col justify-between h-full gap-8">
                                    <p className="text-sm font-normal leading-relaxed text-zinc-700 dark:text-zinc-200">
                                        &ldquo;{item.quote}&rdquo;
                                    </p>

                                    <div className="flex items-center gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/80">
                                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-ink dark:text-white border border-zinc-200/80 dark:border-zinc-700/80">
                                            {item.avatar_url ? (
                                                <Image
                                                    src={item.avatar_url}
                                                    alt={item.author}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <User className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                                            )}
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm text-ink dark:text-white tracking-tight">
                                                {item.author}
                                            </span>
                                            <span className="text-xs text-muted-foreground dark:text-zinc-400 font-normal">
                                                {item.role}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Bottom Caption Added Here */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 tracking-wide uppercase">
                    <span className="h-2 w-2 rounded-full bg-brand" />
                    Hear the words of our customers
                </div>
            </div>
        </section>
    );
}