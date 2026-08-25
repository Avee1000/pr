import Link from "next/link";
import Header from "@/components/global/Header";

export default function NotFound() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden text-ink font-sans">
      {/* Header */}
      <div className="shrink-0">
        <Header showNavigation={false} />
      </div>

      {/* Main Container - Dynamic Layout */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Background Grid Accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[linear-gradient(var(--color-ink)_1px,transparent_1px),linear-gradient(90deg,var(--color-ink)_1px,transparent_1px)] dark:bg-[linear-gradient(var(--color-muted-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-muted-foreground)_1px,transparent_1px)] dark:opacity-[0.07]"
          style={{
            backgroundSize: "56px 56px",
          }}
        />

        {/* Main Content Area */}
        <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-between gap-6 px-6 py-4 text-center sm:flex-row sm:text-left sm:gap-12 sm:px-12 sm:py-8">
          
          {/* Left Column: Text & Navigation */}
          <div className="flex flex-1 flex-col items-center justify-center sm:items-start max-w-lg">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-ink/55 dark:text-muted-foreground uppercase sm:mb-4">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-action" />
              Error 404
            </div>

            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-ink dark:text-muted-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Wrong turn <br className="hidden sm:inline" />
              somewhere back there.
            </h1>

            <p className="mt-3 mb-6 max-w-md text-sm leading-relaxed text-ink/65 dark:text-muted-foreground sm:mt-4 sm:mb-8 sm:text-base">
              The page you&rsquo;re looking for doesn&rsquo;t exist, moved, or
              never made it off the drawing board. Let&rsquo;s get you back on
              route.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              <Link
                href="/"
                className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-ink border border-ink shadow-[0_8px_20px_-8px_rgba(255,74,60,0.55)] transition-opacity hover:opacity-95"
              >
                Back to home
              </Link>
              <Link
                href="/products"
                className="border-b-[1.5px] border-ink dark:border-muted-foreground pb-0.5 text-sm font-semibold text-ink dark:text-muted-foreground opacity-80 transition-opacity hover:opacity-100"
              >
                Request Help
              </Link>
            </div>
          </div>

          {/* Right Column: Scalable SVG Graphic */}
          <div className="flex flex-1 items-center justify-center w-full max-w-70 sm:max-w-90 md:max-w-105">
            <svg
              className="h-auto w-full max-h-[35vh] sm:max-h-[50vh]"
              viewBox="0 0 380 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="A compass needle pointing off course"
            >
              {/* Ghost 404 behind the compass */}
              <text
                x="190"
                y="240"
                textAnchor="middle"
                className="font-heading font-bold text-[150px] fill-ink dark:fill-muted-foreground dark:opacity-30 opacity-10"
              >
                404
              </text>

              {/* Outer Rings */}
              <circle cx="190" cy="190" r="150" stroke="#FFC200" strokeWidth="1.5" className="opacity-55" />
              <circle cx="190" cy="190" r="118" stroke="#1A1A1A" strokeWidth="1" className="opacity-12 dark:stroke-muted-foreground dark:opacity-20" />
              <circle cx="190" cy="190" r="86" stroke="#FFC200" strokeWidth="1.5" className="opacity-35" />

              {/* Tick Marks */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                const r1 = 150;
                const r2 = i % 6 === 0 ? 138 : 144;
                const x1 = 190 + r1 * Math.cos(rad);
                const y1 = 190 + r1 * Math.sin(rad);
                const x2 = 190 + r2 * Math.cos(rad);
                const y2 = 190 + r2 * Math.sin(rad);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#1A1A1A"
                    strokeWidth={i % 6 === 0 ? 2 : 1}
                    className={i % 6 === 0 ? "opacity-40 dark:stroke-muted-foreground dark:opacity-60" : "opacity-20 dark:stroke-muted-foreground dark:opacity-60"}
                  />
                );
              })}

              {/* Compass Housing */}
              <circle cx="190" cy="190" r="60" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="1.5" />

              {/* Needle */}
              <g transform="rotate(38 190 190)">
                <path d="M190 138 L202 190 L190 242 L178 190 Z" fill="#1A1A1A" className="opacity-90" />
                <path d="M190 138 L202 190 L190 190 Z" fill="#FF4A3C" />
              </g>
              <circle cx="190" cy="190" r="7" fill="#1A1A1A" />

              {/* Scattered Wayfinding Marks */}
              <circle cx="60" cy="70" r="4" fill="#FF4A3C" />
              <rect
                x="316"
                y="56"
                width="10"
                height="10"
                transform="rotate(20 321 61)"
                fill="none"
                stroke="#1A1A1A"
                strokeWidth="1.5"
                className="opacity-50 dark:stroke-muted-foreground dark:opacity-60"
              />
              <polygon points="46,300 56,318 36,318" fill="#FFC200" className="opacity-80 dark:stroke-muted-foreground dark:opacity-60" />
              <circle cx="330" cy="290" r="3" fill="#1A1A1A" className="opacity-50 dark:stroke-muted-foreground dark:opacity-60" />
              <circle cx="90" cy="330" r="5" fill="none" stroke="#FF4A3C" strokeWidth="1.5" />
            </svg>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 shrink-0 py-4 text-center text-xs text-ink/40">
          © {new Date().getFullYear()} Company. All rights reserved.
        </footer>
      </div>
    </div>
  );
}