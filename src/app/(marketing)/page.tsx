import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Testimonials } from "@/components/homePage/Testimonial";
import { Features } from "@/components/homePage/Features";
import { HowItWorks } from "@/components/homePage/HowItWorks";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

async function getProjects() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
  const res = await fetch(new URL('/hello', baseUrl), { cache: 'no-store' });

  if (!res.ok) throw new Error("Failed to fetch projects");

  const json = await res.json();
  console.log(json);
  return json?.message ?? json;
}

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="shrink-0">
        <Header />
      </div>
      <div className="overflow-y-auto  scrollbar-thin scrollbar-thumb-ink dark:scrollbar-thumb-white">
        <div className="flex flex-col min-h-screen">
          <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-6 px-4 min-h-[85vh] text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-1.5 shadow-sm text-xs font-semibold text-ink">
              <span className="h-2 w-2 rounded-full bg-action" />
              Streamline Your Workflow
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold tracking-tight text-ink dark:text-white">
              PriceRight &amp; QuoteEasy
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Price your work with confidence, manage orders from quote to delivery, and keep track of
              your cash flow.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              {user ? (
                <Link href="/dashboard" className={`${buttonVariants()} px-6 py-5`}>
                  Go to your workspace
                </Link>
              ) : (
                <>
                  <Link href="/signup" className={`${buttonVariants()}`}>
                    Create an account
                  </Link>
                  <Link href="/login" className={`${buttonVariants({ variant: "outline" })}`}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </main>

          {/* <Features user={!!user} /> */}
          {/* <HowItWorks /> */}
          <Testimonials />
        </div>
        <Footer />
      </div>
    </>

  );

}
