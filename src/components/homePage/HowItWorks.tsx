"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Sliders, Send, CheckCircle2, ArrowRight } from "lucide-react";

/*  Scroll-reveal hook                                                 */

function useInView<T extends HTMLElement>(threshold = 0.4) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -12% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/*  Data — the three stages of the pipeline, in the order they run     */

const steps = [
  {
    number: "01",
    title: "Configure Assumptions",
    description:
      "Define your baseline target monthly compensation, available working hours, material expenses, and target profit margins into a unified pricing template.",
    icon: Sliders,
    accent: "bg-brand",
    ring: "ring-brand/30",
    next: "Feeds into quote generation",
  },
  {
    number: "02",
    title: "Generate & Dispatch Quotes",
    description:
      "Instantly translate calculations into secure, professional public quote links. Clients review specifications and execute approvals with a single tap.",
    icon: Send,
    accent: "bg-action",
    ring: "ring-action/30",
    next: "Feeds into order execution",
  },
  {
    number: "03",
    title: "Execute & Track Cash Flow",
    description:
      "Monitor order execution from start to delivery while automated telemetry tracks revenues, pending balances, and overdue payment health.",
    icon: CheckCircle2,
    accent: "bg-ink dark:bg-muted-foreground",
    ring: "ring-ink/20",
    next: "Closes the loop",
  },
] as const;

/*  A single stage on the timeline                                     */

function Stage({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const Icon = step.icon;
  const onRight = index % 2 === 1;

  const content = (
    <div
      className={`flex flex-col gap-3 max-w-md transition-all duration-700 ease-out ${
        inView
          ? "opacity-100 translate-y-0"
          : `opacity-0 translate-y-6 ${onRight ? "lg:-translate-x-4" : "lg:translate-x-4"}`
      } ${onRight ? "lg:text-left" : "lg:text-right"}`}
      style={{ transitionDelay: inView ? `${index * 90}ms` : "0ms" }}
    >
      <div
        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
          onRight ? "lg:justify-start" : "lg:justify-end"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${step.accent}`} />
        Stage {step.number}
      </div>

      <h3 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-ink dark:text-muted-foreground">
        {step.title}
      </h3>

      <p className="text-lg text-ink-dark font-normal leading-relaxed">
        {step.description}
      </p>

      <div
        className={`flex items-center gap-1.5 pt-1 text-xs font-semibold text-muted-foreground ${
          onRight ? "lg:flex-row" : "lg:flex-row-reverse"
        }`}
      >
        <ArrowRight
          className={`h-3.5 w-3.5 shrink-0 ${onRight ? "" : "lg:rotate-180"}`}
        />
        {step.next}
      </div>
    </div>
  );

  const ghostNumber = (
    <span
      aria-hidden
      className="hidden lg:block select-none font-heading font-bold text-ink/6 dark:text-white/10 text-[9rem] leading-none tracking-tighter"
    >
      {step.number}
    </span>
  );

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-[3.5rem_1fr] lg:grid-cols-[1fr_3.5rem_1fr] items-center gap-x-5 lg:gap-x-10"
    >
      {/* left slot (desktop only) */}
      <div className="hidden lg:flex justify-end">
        {onRight ? ghostNumber : content}
      </div>

      {/* node */}
      <div className="relative z-10 flex justify-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-background border border-border text-ink shadow-sm transition-all duration-500 ease-out ${
            inView ? "scale-100 opacity-100" : "scale-75 opacity-0"
          } ${inView ? `ring-4 ${step.ring}` : "ring-0"}`}
          style={{ transitionDelay: inView ? `${index * 90}ms` : "0ms" }}
        >
          <Icon className="h-5 w-5 dark:text-muted-foreground" />
        </div>
      </div>

      {/* right slot (mobile: content always here; desktop: alternates) */}
      <div className="lg:flex lg:justify-start">
        <div className="lg:hidden">{content}</div>
        <div className="hidden lg:block">{onRight ? content : ghostNumber}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                             */
/* ------------------------------------------------------------------ */

export function HowItWorks() {
  return (
    <section className="relative w-full border-t border-border bg-background py-32 overflow-hidden transition-colors">
      <style>{`
        @keyframes pipeline-flow {
          0%   { transform: translateY(-10%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(110%); opacity: 0; }
        }
        .pipeline-flow {
          animation: pipeline-flow 3.6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .pipeline-flow { animation: none; opacity: 0.6; }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-28 gap-5">
          <div className="inline-flex items-center gap-2 bg-white rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-ink shadow-2xs uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-action" />
            3 stages · fully automated
          </div>
          <h2 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight max-w-4xl text-balance">
            How PriceRight &amp; QuoteEasy scales your business
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground font-normal leading-relaxed">
            A frictionless pipeline designed to transition independent professionals from chaotic spreadsheets to deterministic profitability.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* spine */}
          <div
            aria-hidden
            className="absolute top-2 bottom-2 left-7 lg:left-1/2 w-px bg-border -translate-x-1/2"
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-28 bg-linear-to-b from-transparent via-ink/40 to-transparent pipeline-flow" />
          </div>

          <div className="flex flex-col gap-20 lg:gap-28">
            {steps.map((step, index) => (
              <Stage key={step.number} step={step} index={index} />
            ))}
          </div>

        </div>

        {/* Callout / CTA */}
        <div className="mt-20 rounded-3xl bg-ink p-10 sm:p-14 lg:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-10 lg:gap-16">
            <div className="flex-1 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-action" />
                End of pipeline
              </div>
              <h3 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight max-w-lg text-balance">
                Ready to deploy your pricing workspace?
              </h3>
              <p className="max-w-md text-body text-slate-300 font-normal leading-relaxed">
                Set up your target margin profiles and dispatch your first professional quote in less than two minutes.
              </p>
            </div>

            <div className=" sm:block w-px self-stretch bg-white/10" aria-hidden />

            <div className="flex flex-col gap-4 w-auto lg:w-auto">
              <Link
                href="/signup"
                className={`${buttonVariants()} font-semibold px-8 py-6 text-button transition-transform duration-300 hover:scale-105 shadow-lg justify-center`}
              >
                Get started for free
              </Link>
              <Link
                href="/login"
                className={`${buttonVariants({ variant: "outline" })} border-brand bg-transparent text-white hover:bg-brand/20 px-8 py-6 text-button transition-transform duration-300 hover:scale-105 justify-center`}
              >
                Sign into dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}