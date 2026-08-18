

export default function ProfileSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col justify-start gap-4 p-4 dark:border dark:border-muted-foreground/20 rounded-2xl">
                <div className="flex justify-between items-start">
                    <div className="size-30 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex flex-col items-end gap-1">
                        <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-7 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
            </div>

            {/* Card Content Skeleton */}
            <div className="p-6 border border-muted-foreground/20 rounded-2xl space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 border border-muted-foreground/20 rounded-2xl space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 border border-muted-foreground/20 rounded-2xl space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}