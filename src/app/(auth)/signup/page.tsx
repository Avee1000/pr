import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ThemeToggleIcon from "@/components/global/ThemeIconButton";
import { SignUpForm } from "@/components/auth/Signup"

export const metadata: Metadata = {
  title: "Create Account | PriceRight",
  description: "Create a PriceRight account to start pricing your work and tracking your orders efficiently.",
  robots: {
    index: false, // Don't index auth pages in Google search results
    follow: true,
  },
  openGraph: {
    title: "Create Account | PriceRight",
    description: "Create a PriceRight account to start pricing your work and tracking your orders efficiently.",
  },
};

export default function SignUpPage() {
  return (
    <main className="mx-auto sm:min-h-screen max-sm:h-dvh flex w-full flex-1 flex-col justify-center items-center px-4 sm:py-12">
      <div className="absolute top-0 left-0 m-4 sm:hidden">
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
      </div>
      <div className="absolute top-0 right-0 m-4 sm:hidden">
        <ThemeToggleIcon />
      </div>

      <SignUpForm />
    </main>
  );
}