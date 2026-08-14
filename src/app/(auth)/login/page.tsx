import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ThemeToggleIcon from "@/components/global/ThemeIconButton";
import { LoginForm } from "@/components/auth/Login";

export const metadata: Metadata = {
  title: "Sign In | PriceRight",
  description: "Sign in to your PriceRight workspace to manage quotes, jobs, and pricing.",
  openGraph: {
    title: "Sign In | PriceRight",
    description: "Sign in to your PriceRight workspace to manage quotes, jobs, and pricing.",
  },
};
export default function LoginPage() {
  return (
    <main className="mx-auto sm:min-h-screen max-sm:h-dvh flex w-full max-w-md flex-1 flex-col justify-center px-4 sm:py-12">
      <div className="absolute top-0 left-0 m-4">
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
      <div className="absolute top-0 right-0 m-4">
        <ThemeToggleIcon />
      </div>

      <LoginForm />
    </main>
  );
}