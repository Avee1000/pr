import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ThemeToggleIcon from "@/components/global/ThemeIconButton";
import { LoginForm } from "@/components/auth/login/forms/Login";
import { LoginPageComp } from "@/components/auth/login/LoginPageComp";
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
    <main className="flex-1 w-full min-h-0 flex flex-col overflow-hidden relative">
      <div className="absolute top-6 right-6  z-10">
        <ThemeToggleIcon />
      </div>

      <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-center overflow-hidden">
        <LoginPageComp />
      </div>
    </main>
  );
}