import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import { GlobalAlert } from '@/components/feedback/GlobalAlert';
import { Suspense } from 'react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-ink dark:scrollbar-thumb-white">
                <main className="flex-1">{children}</main>
                <Footer />
            </div>
        </div>
    );
}