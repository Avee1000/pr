import Link from "next/link";
import Image from "next/image";
import { LoginPageSelector } from "./LoginSelector";
import { cn } from '@/lib/utils'

function LogoLink({ className }: { className: string}) {
    return (
        <div className={cn("flex flex-row items-center justify-between", className)}>
            <Link href="/" className="flex items-center gap-2">
                <Image
                    src="/android-chrome-512x512.png"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                    priority
                    alt="PriceRight Logo"
                />
            </Link>
        </div>
    )
}

export function LoginPageComp() {
    return (
        <div className="grid min-h-screen grid-cols-1 bg-background text-foreground xl:grid-cols-12 w-full">
            {/* Column 2: Who We Are / Hero Feature Panel */}
            <div className="relative hidden flex-col dark:bg-ink-darker bg-white justify-center items-center overflow-hidden border-r border-muted-foreground/25 p-12 xl:col-span-7 px-8 py-6 w-full xl:flex xl:p-16">
                <LogoLink className={'max-xl:hidden absolute top-6 left-8'}/>
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "radial-gradient(white 1px, 1px)",
                        backgroundSize: "24px 24px",
                    }}
                    aria-hidden="true"
                />

                <div className="relative z-10 flex flex-col items-center max-w-xl text-center">
                    {/* "Who We Are" Card */}
                    <div className="relative w-full mt-10">
                        <div className="relative max-w-xl text-left">
                            <span
                                aria-hidden="true"
                                className="absolute -top-3 -left-6 select-none font-sans text-7xl font-black text-muted-foreground/60 leading-none"
                            >
                                &#8221;
                            </span>
                            <p className="relative z-10 text-2xl font-medium tracking-tight text-ink dark:text-white leading-snug">
                                PriceRight helps self-employed professionals and micro-entrepreneurs eliminate pricing guesswork. Calculate exact labor and material costs, manage custom orders seamlessly, and share professional quote pages with your clients.
                            </p>
                        </div>

                        {/* Smaller Illustration graphic positioned directly below */}
                        <div className="relative mt-8 flex items-center justify-end w-full hidden">
                            <svg
                                className="size-50"
                                viewBox="0 0 480 320"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <defs>
                                    <marker
                                        id="dim-arrow"
                                        viewBox="0 0 10 10"
                                        refX="5"
                                        refY="5"
                                        markerWidth="5"
                                        markerHeight="5"
                                        orient="auto-start-reverse"
                                    >
                                        <path d="M0,0 L10,5 L0,10 Z" className="fill-brand" />
                                    </marker>
                                </defs>

                                {/* {[[28, 28], [452, 28], [28, 292], [452, 292]].map(([x, y]) => (
                                    <g key={`${x}-${y}`} className="stroke-brand/30" strokeWidth="1">
                                        <line x1={x - 7} y1={y} x2={x + 7} y2={y} />
                                        <line x1={x} y1={y - 7} x2={x} y2={y + 7} />
                                    </g>
                                ))} */}

                                <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                                    <rect x="140" y="60" width="200" height="180" rx="12" className="stroke-border" strokeWidth="2" fill="#1A1A1A" />
                                    <line x1="170" y1="100" x2="310" y2="100" className="stroke-muted-foreground/40" strokeWidth="3" />
                                    <line x1="170" y1="130" x2="270" y2="130" className="stroke-muted-foreground/40" strokeWidth="3" />
                                    <line x1="170" y1="160" x2="290" y2="160" className="stroke-muted-foreground/40" strokeWidth="3" />
                                </g>

                                <rect
                                    x="260"
                                    y="170"
                                    width="150"
                                    height="64"
                                    rx="10"
                                    className="fill-ink stroke-brand"
                                    strokeWidth="1.5"
                                />
                                <text
                                    x="335"
                                    y="193"
                                    textAnchor="middle"
                                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                                    fontSize="9"
                                    letterSpacing="1.5"
                                    className="fill-muted-foreground"
                                >
                                    SUGGESTED PRICE
                                </text>
                                <text
                                    x="335"
                                    y="218"
                                    textAnchor="middle"
                                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                                    fontSize="20"
                                    fontWeight="600"
                                    className="fill-brand tabular-nums"
                                >
                                    $245.00
                                </text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative flex flex-col justify-between xl:col-span-5 px-8 py-6 min-h-screen">
                <LogoLink className={'xl:hidden'}/>
                {/* Main Form Center Box - Exact Vertical & Horizontal Middle */}
                <div className="flex-1 flex flex-col justify-center items-center w-full">
                    <div className="w-full max-w-lg">
                        <div className="mt-8">
                            <LoginPageSelector />
                        </div>
                    </div>
                </div>

                {/* Footer Section: Sign In Link + Legal Terms */}
                <div className="w-full max-w-sm mx-auto flex flex-col gap-10 text-center">
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-semibold text-foreground underline">
                            Create one
                        </Link>
                    </p>

                    <p className="text-xs  leading-relaxed text-muted-foreground">
                        By creating an account, you agree to the{" "}
                        <a href="/terms" className="underline underline-offset-2 hover:text-ink">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="underline underline-offset-2 hover:text-ink">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}