import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ThemeToggleIcon from "@/components/global/ThemeIconButton";
import { SignUpPageComp } from "@/components/auth/signup/SignUpPageComp";

export const metadata: Metadata = {
  title: "Create Account | PriceRight",
  description: "Create a PriceRight account to start pricing your work and tracking your orders efficiently.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Create Account | PriceRight",
    description: "Create a PriceRight account to start pricing your work and tracking your orders efficiently.",
  },
};

export default function SignUpPage() {
  return (
    <main className="flex-1 w-full min-h-0 flex flex-col overflow-hidden relative">
      {/* <div className="absolute top-6 left-6 sm:hidden  z-10">
        <Link href="/" className="flex items-center gap-1 text-lg font-semibold text-ink dark:text-white">
          <Image
            src="/android-chrome-512x512.png"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
            alt="PriceRight Logo"
          />
          PriceRight
        </Link>
      </div> */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggleIcon />
      </div>

      {/* Replaced h-full max-h-full with flex-1 min-h-0 */}
      <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-center overflow-hidden">
        <SignUpPageComp />
      </div>
    </main>
  );
}