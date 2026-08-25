import { GlobalAlert } from '@/components/feedback/GlobalAlert';
import { Suspense } from 'react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 min-h-0 flex flex-col w-full">
            {children}
        </div>
    );
}