import { LoadingState } from '@/components/feedback/loading-state';

export function DeviceAndSessionsSkeleton() {
    return (
        <div className="flex flex-col gap-6 mx-auto py-6 font-sans animate-pulse">
            {/* Page Header Skeleton */}
            <div className="space-y-2">
                <div className="h-7 w-96 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                <div className="h-4 w-full max-w-xl bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* Section 1: Dynamic Client Hardware Specifications Skeleton */}
            <section className="rounded-2xl border border-muted-foreground/20 shadow-sm p-6 space-y-6">
                <div className="flex max-sm:flex-col sm:items-center justify-start sm:justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="h-5 w-60 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full max-sm:mt-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-ink rounded-lg border border-gray-100 dark:border-zinc-800 space-y-2">
                            <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 2: Active User Sessions Skeleton */}
            <section className="rounded-2xl border border-muted-foreground/20 shadow-sm p-6 space-y-4">
                <div className="space-y-1">
                    <div className="h-5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-4 w-80 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 pt-2">
                    {[...Array(1)].map((_, i) => (
                        <div key={i} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex gap-2 items-center">
                                    <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                    <div className="h-5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                    <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                    <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 3: Security & Audit Trail Skeleton */}
            <section className="flex flex-col p-6 border border-muted-foreground/20 rounded-2xl shadow-sm space-y-6">
                <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="h-5 w-44 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

    // if (!user) {
    //     return null;
    // }

    // useEffect(() => {
    //     async function loadSessionData() {
    //         const currentSession = await getCurrentSession(user);
    //         setSessions(currentSession);
    //     }
    //     loadSessionData();
    // }, []);


    // useEffect(() => {
    //     async function loadHardwareSpecs() {
    //         const highEntropy = await getDeviceModel();
    //         const hardware = getHardwareCapacity();

    //         setDeviceProfile({
    //             deviceModel: highEntropy?.brandModel || 'Standard Web Client',
    //             platform: highEntropy?.platform || navigator.platform,
    //             architecture: highEntropy?.architecture || 'Standard Architecture',
    //             cpuCores: hardware.cpuCores,
    //             ram: hardware.deviceMemoryRAM,
    //             screenResolution: `${window.screen.width}x${window.screen.height} @ ${window.devicePixelRatio}x DPI`
    //         });
    //         setLoading(false);
    //     }

    //     loadHardwareSpecs();
    // }, []);