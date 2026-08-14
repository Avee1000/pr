import Image from "next/image";
import Link from "next/link";
import MobileHideWrapper
  from "./MobileHideWrapper";
export default function Footer() {
  const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];
  return (
    <MobileHideWrapper routes={AUTH_ROUTES} breakpoint={768}>
      <footer className="mt-auto border-t bg-white dark:bg-ink">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand Column */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center">
                {/* Container sized to match standard logo proportions with explicit dimensions */}
                <div className="relative h-10 w-36">
                  <Image
                    src="/android-chrome-512x512.png"
                    alt="PriceRight & QuoteEasy Logo"
                    fill
                    sizes="144px"
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                Streamlining pricing, orders, and cash flow for micro-entrepreneurs.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-3">
              <h2 className="font-heading text-sm font-semibold text-ink dark:text-white">Product</h2>
              <ul className="space-y-2 text-sm text-muted-foreground dark:text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-ink dark:hover:text-white transition-colors">
                    Pricing Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-ink dark:hover:text-white transition-colors">
                    Order Management
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-ink dark:hover:text-white transition-colors">
                    Cash Flow
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="space-y-3">
              <h2 className="font-heading text-sm font-semibold text-ink dark:text-white">Resources</h2>
              <ul className="space-y-2 text-sm text-muted-foreground dark:text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-ink dark:hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-ink dark:hover:text-white transition-colors">
                    Pricing Guides
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-ink dark:hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-3">
              <h2 className="font-heading text-sm font-semibold text-ink dark:text-white">Legal</h2>
              <ul className="space-y-2 text-sm text-muted-foreground dark:text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-ink dark:hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-ink dark:hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 border-t pt-8 flex flex-col items-center justify-between sm:flex-row">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              &copy; {new Date().getFullYear()} PriceRight &amp; QuoteEasy. Built for WDD 430. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6 sm:mt-0 text-xs text-muted-foreground dark:text-muted-foreground">
              <span>Secure Supabase Auth</span>
              <span>&bull;</span>
              <span>TypeScript Strict Mode</span>
            </div>
          </div>
        </div>
      </footer>
    </MobileHideWrapper>
  );
}