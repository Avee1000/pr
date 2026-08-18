'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { User } from '@supabase/supabase-js';
import { LoadingState } from '@/components/feedback/loading-state';
// import { getDeviceModel } from '@/components/global/DeviceInformation';
import { DeviceAndSessionsSkeleton } from '@/components/accounts/audit-trail/DeviceAndSessionsSkeleton'

export interface DeviceModelHints {
    brandModel: string;
    platform: string;
    architecture: string;
}

export interface DeviceHardwareProfile {
    deviceModel: string;
    platform: string;
    architecture: string;
    cpuCores: number | string;
    ram: string;
    screenResolution: string;
}

export interface UserSession {
    id: string;
    deviceName: string;
    browser: string;
    location: string;
    ipAddress: string;
    lastActive: string;
    isCurrent: boolean;
}

export interface SecurityAuditLog {
    accountCreated: string;
    lastPasswordChange: string;
    recentLoginLocation: string;
}

export async function getDeviceModel(): Promise<DeviceModelHints | null> {
    if (typeof window !== 'undefined' && (navigator as any).userAgentData?.getHighEntropyValues) {
        try {
            const hints = await (navigator as any).userAgentData.getHighEntropyValues([
                'architecture',
                'model',
                'platform',
                'platformVersion',
                'fullVersionList',
                'bitness'
            ]);

            const fallbackName = hints.platform ? `${hints.platform} Device` : 'Unknown Model';
            const modelName = hints.model && hints.model.trim() !== '' ? hints.model : fallbackName;

            return {
                brandModel: modelName,
                platform: `${hints.platform} ${hints.platformVersion}`,
                architecture: `${hints.architecture} (${hints.bitness}-bit)`
            };
        } catch (e) {
            console.warn('High-entropy hints permission denied or failed:', e);
        }
    }
    return null;
}

async function getGeoLocation() {
    const CACHE_KEY = 'cached_user_geo';

    // 1. Check local session cache first
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
        try {
            console.log('Using cached location data...')
            return JSON.parse(cached);
        } catch {
            sessionStorage.removeItem(CACHE_KEY);
        }
    }

    try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
            const geo = await res.json();
            const locationData = {
                ipAddress: geo.ip || 'Unavailable',
                location: geo.city && geo.country_name
                    ? `${geo.city}, ${geo.country_name}`
                    : geo.country_name || 'Unknown'
            };
            console.log('Using ipapi')
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(locationData));
            return locationData;
        }
    } catch (err) {
        console.warn('GeoIP fetch failed:', err);
    }

    return { ipAddress: 'Unavailable', location: 'Unknown' };
}

export async function getCurrentSession(user: User | null) {
    if (!user) return [];

    const [{ ipAddress, location }, device] = await Promise.all([
        getGeoLocation(),
        getDeviceModel()
    ]);

    return [{
        id: 'current-session',
        deviceName: device?.brandModel || 'Web Browser',
        browser: device?.platform || navigator.userAgent,
        location: location,
        ipAddress: ipAddress,
        lastActive: 'Active now',
        isCurrent: true,
    }];
}
export function getHardwareCapacity() {
    if (typeof window === 'undefined') {
        return { cpuCores: 'N/A', deviceMemoryRAM: 'N/A' };
    }

    const cpuCores = navigator.hardwareConcurrency || 'Unknown';
    const deviceMemory = (navigator as any).deviceMemory
        ? `~${(navigator as any).deviceMemory} GB`
        : 'Not Disclosed (Safari/Firefox Guarded)';

    return { cpuCores, deviceMemoryRAM: deviceMemory };
}

// Props Definition
interface DeviceAndSessionsPageProps {
    auditLogs?: SecurityAuditLog;
    // onRevokeSession: (sessionId: string) => Promise<void> | void;
}

export default function DeviceAndSessionsPage({
    auditLogs,
    // onRevokeSession
}: DeviceAndSessionsPageProps) {
    const [deviceProfile, setDeviceProfile] = useState<Partial<DeviceHardwareProfile>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const { user, isLoadingProfile: authLoading } = useAuth();

    useEffect(() => {
        // Only run data fetching once the user object is actually available
        if (!user) return;

        async function loadPageData() {
            try {
                const [currentSession, highEntropy] = await Promise.all([
                    getCurrentSession(user),
                    getDeviceModel()
                ]);

                const hardware = getHardwareCapacity();

                setSessions(currentSession);
                setDeviceProfile({
                    deviceModel: highEntropy?.brandModel || 'Standard Web Client',
                    platform: highEntropy?.platform || navigator.platform,
                    architecture: highEntropy?.architecture || 'Standard Architecture',
                    cpuCores: hardware.cpuCores,
                    ram: hardware.deviceMemoryRAM,
                    screenResolution: `${window.screen.width}x${window.screen.height} @ ${window.devicePixelRatio}x DPI`
                });
            } catch (error) {
                console.error("Error loading device and session specs:", error);
            } finally {
                setLoading(false);
            }
        }

        loadPageData();
    }, [user]);

    // 2. Show the skeleton if auth is initializing OR page telemetry is still loading
    if (authLoading || loading) {
        return <DeviceAndSessionsSkeleton />;
    }

    return (
        <div className="flex flex-col gap-6 mx-auto py-3 font-sans text-ink dark:text-zinc-200">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-medium text-ink dark:text-zinc-100">Device Specifications & Active Sessions</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage hardware telemetry, active logins, and view security metadata for your account.
                </p>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* Section 1: Dynamic Client Hardware Specifications */}
            <section className="rounded-2xl border border-muted-foreground/20 shadow-sm p-6">
                <div className="flex max-sm:flex-col sm:items-center justify-start sm:justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-base font-semibold text-ink dark:text-zinc-100">Current Device Specifications</h2>
                    <span className="inline-flex items-center max-sm:w-fit  max-sm:mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Telemetry Active
                    </span>
                </div>

                {loading ? (
                    <div className="py-8 text-center text-sm text-ink dark:text-muted-foreground animate-pulse">
                        {/* <LoadingState iconOnly={false} description='Gathering hardware metrics...' size='lg' /> */}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6">
                        <div className="p-4 bg-gray-50 dark:bg-ink rounded-lg border dark:border-transparent border-gray-100">
                            <span className="block text-xs text-gray-500 dark:text-muted-foreground uppercase font-medium">Device Model</span>
                            <span className="text-sm font-semibold ">{deviceProfile.deviceModel}</span>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-ink rounded-lg border dark:border-transparent border-gray-100">
                            <span className="block text-xs text-gray-500 dark:text-muted-foreground uppercase font-medium">Platform & OS</span>
                            <span className="text-sm font-semibold ">{deviceProfile.platform}</span>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-ink rounded-lg border dark:border-transparent border-gray-100">
                            <span className="block text-xs text-gray-500 dark:text-muted-foreground uppercase font-medium">Architecture</span>
                            <span className="text-sm font-semibold ">{deviceProfile.architecture}</span>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-ink rounded-lg border dark:border-transparent border-gray-100">
                            <span className="block text-xs text-gray-500 dark:text-muted-foreground uppercase font-medium">CPU Logic Cores</span>
                            <span className="text-sm font-semibold ">{deviceProfile.cpuCores} Threads</span>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-ink rounded-lg border dark:border-transparent border-gray-100">
                            <span className="block text-xs text-gray-500 dark:text-muted-foreground uppercase font-medium">Estimated RAM</span>
                            <span className="text-sm font-semibold ">{deviceProfile.ram}</span>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-ink rounded-lg border dark:border-transparent border-gray-100">
                            <span className="block text-xs text-gray-500 dark:text-muted-foreground uppercase font-medium">Display Metric</span>
                            <span className="text-sm font-semibold ">{deviceProfile.screenResolution}</span>
                        </div>
                    </div>
                )}
            </section>

            {/* Section 2: Active User Sessions */}
            <section className="rounded-2xl border border-muted-foreground/20 shadow-sm p-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-base font-semibold text-ink dark:text-zinc-100">Active Sessions</h2>
                    <p className="text-sm text-muted-foreground">
                        Devices currently logged into your account. Revoke access to any sessions you don't recognize.
                    </p>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 pt-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex gap-2 max-sm:flex-col sm:items-center max-sm:justify-start">
                                    <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                        {session.deviceName} — {session.browser}
                                    </span>
                                    {session.isCurrent ? (
                                        <span className="inline-flex items-center max-sm:w-fit px-2 py-0.5 max-sm:mb-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                                            Current Session
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 max-sm:flex-col">
                                    <span>Location: {session.location}</span>
                                    <span>IP: {session.ipAddress}</span>
                                    <span>Last Active: {session.lastActive}</span>
                                </div>
                            </div>

                            {!session.isCurrent && (
                                <button
                                    // onClick={() => onRevokeSession(session.id)}
                                    className="px-3 py-1.5 text-xs font-medium rounded-md text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    Revoke Access
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 3: Security & Audit Trail */}
            <section className="flex flex-col p-6 border border-muted-foreground/20 rounded-2xl shadow-sm">
                <h3 className="text-base font-semibold text-ink dark:text-zinc-100 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    Security Audit Logs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">Account Created</span>
                        <span className="text-sm text-ink dark:text-zinc-200 font-mono">{(user?.created_at ? `${new Date(user.created_at).toLocaleDateString()} ${new Date(user.created_at).toLocaleTimeString()}` : 'Not specified')}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">Last Password Change</span>
                        <span className="text-sm font-medium text-ink dark:text-zinc-200">{auditLogs?.lastPasswordChange}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">Recent Login Location</span>
                        <span className="text-sm font-medium text-ink dark:text-zinc-200">{auditLogs?.recentLoginLocation}</span>
                    </div>
                </div>
            </section>
        </div>
    );
}