import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import { Toaster } from "@/components/ui/sonner";
import { Loader } from "lucide-react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import TopLoader from "@/components/global/TopLoader";
import { RootProviders } from "@/components/providers/ProfileProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import  { Toaster as ReactToaster } from 'react-hot-toast';
import { FiLoader } from "react-icons/fi";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "PriceRight & QuoteEasy",
  description:
    "Price your work, manage orders from quote to delivery, and track your cash flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        "max-sm:text-[calc(var(--text-xs)+1.5px)]!",
        inter.variable,
        poppins.variable,
      )}
    >
      <head>
        {/* Pre-hydration theme script: sets `dark` class on <html> before first paint
            so production HTML doesn't flash light→dark. Mirrors the storage key +
            defaultTheme + enableSystem used by next-themes below. Keep in sync with
            the <ThemeProvider> props; mismatches cause a hydration flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-background max-w-full text-foreground overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <RootProviders>
              <Header />
              <div className="relative">
                <TopLoader />
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-ink dark:scrollbar-thumb-white">
                <main className="flex-1">{children}</main>
                <Toaster
                  icons={{
                    loading: <FiLoader className="size-4 animate-spin" />,
                  }}
                  richColors
                  duration={4000}
                  position="top-center"
                />                
                <ReactToaster/>
                <Footer />
              </div>
            </RootProviders>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}