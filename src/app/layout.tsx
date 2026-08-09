import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { Loader } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import TopLoader from "@/components/TopLoader";

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
        inter.variable,
        poppins.variable,
      )}
    >
      <body className="flex min-h-screen flex-col bg-background max-w-full text-foreground overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <div className="relative">
            <TopLoader />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-ink dark:scrollbar-thumb-white">
            <main className="flex-1">{children}</main>
            <Toaster
              icons={{
                loading: <Loader className="size-5 animate-spin" />,
              }}
              richColors
              duration={4000}
              position="top-center"
            />
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
