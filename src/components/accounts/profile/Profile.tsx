'use client'

import { useAuth } from "@/components/providers/AuthProvider";
import Image from "next/image";
import { User, Pen } from "lucide-react";
import ProfileSkeleton from "./ProfileSkeleton";
import { DrawerDialogDemo } from "./PhotoUploadEditDrawer";
import { LoadingState } from "@/components/feedback/loading-state";
import { useState } from "react";
import ProfileImageModal from "./PhotoFullView";

export default function ProfileInformation() {
    const [profileImageModalOpen, setProfileImageModalOpen] = useState(false);
    const { profile, user, isLoadingProfile } = useAuth();
    const [imageError, setImageError] = useState(false);

    const fullName = user?.user_metadata?.name ?? "";
    const firstName = fullName.split(" ")[0] ?? "Not specified";
    const middleName = fullName.split(" ")[1] ?? "Not specified";
    const lastName = fullName.split(" ")[2] ?? "Not specified";

    // Keep the skeleton for the initial async hydration only. Once we have a user
    // or profile, the page should render real values instead of staying locked on
    // a null state.
    if (isLoadingProfile && !profile) {
        return <ProfileSkeleton />;
    }

    if (!user) {
        return <ProfileSkeleton />;
    }

    return (
        <div>
            <div className="flex flex-col justify-start gap-2 p-4 dark:border dark:border-muted-foreground/20 rounded-2xl ">
                <div className="flex-row flex justify-between">
                    {profileImageModalOpen && (<ProfileImageModal photoUrl={profile?.avatar_url as string} isOpen={profileImageModalOpen} onClose={() => setProfileImageModalOpen(false)} />) }
                    <div className="relative inline-block shrink-0">
                        <div className="relative size-30 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                            {isLoadingProfile ? (
                                <LoadingState className="opacity-50" />
                            ) : profile?.avatar_url && !imageError ? (
                                <div className="relative w-full h-full cursor-pointer group overflow-hidden rounded-full" title="Profile Photo" onClick={() => setProfileImageModalOpen(true)}>
                                    <Image
                                        src={profile.avatar_url}
                                        alt={user?.user_metadata?.name ?? user?.email ?? "User avatar"}
                                        fill
                                        sizes="400px"
                                        priority
                                        onError={() => setImageError(true)}
                                        className="object-cover transition-transform duration-200 group-hover:scale-103"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                </div>
                            ) : (
                                <User strokeWidth={1} className="size-18 text-muted-foreground" />
                            )}
                        </div>

                        <div className="absolute bottom-1 right-2 z-10 flex items-center justify-center rounded-full p-1 bg-ink dark:bg-white">
                            <DrawerDialogDemo />
                        </div>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-xs text-muted-foreground font-medium">Role</span>
                        <span className="text-sm font-medium text-ink dark:text-zinc-200 truncate">
                            {user?.role ?? "Not specified"}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col min-w-0">
                    <h2 className="text-2xl max-sm:text-xl max-sm:wrap-break-word font-medium text-ink dark:text-white sm:truncate">
                        {user?.user_metadata?.name ?? "Anonymous User"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {user?.email ?? "No email provided"}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-6">
                {/* 1. Personal Information */}
                <div className="flex flex-col p-6 border border-muted-foreground/20 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-base font-semibold text-ink dark:text-zinc-100">
                            Personal Information
                        </h3>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-ink border  border-transparent bg-brand hover:bg-brand/80 transition-colors">
                            Edit <Pen className="size-3" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">First Name</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200 truncate">
                                {firstName ?? "Not specified"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Middle Name</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200 truncate">
                                {middleName ?? "Not specified"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Last Name</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200 truncate">
                                {lastName ?? "Not specified"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Email Address</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200 truncate">
                                {user?.email ?? "john.doe@example.com"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Phone Number</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                {profile?.phone ?? "Not specified"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-1">
                            <span className="text-xs text-muted-foreground font-medium">Bio</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                {profile?.bio ?? "Not specified"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Address Information */}
                <div className="flex flex-col p-6 border border-muted-foreground/20 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-base font-semibold text-ink dark:text-zinc-100">
                            Address Information
                        </h3>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border-ink border dark:border-muted-foreground hover:bg-muted-foreground/10 dark:text-muted-foreground text-ink transition-colors">
                            Edit <Pen className="size-3" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-6">
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <span className="text-xs text-muted-foreground font-medium">Street Address</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200 truncate">
                                {"123 Main Street, Suite 100"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">City</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                {"New York"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">State / Province</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                {"NY"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Postal / ZIP Code</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                {"10001"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Country</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                {profile?.country ?? "United States"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col p-6 border border-muted-foreground/20 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-base font-semibold text-ink dark:text-zinc-100">
                            Regional & Preferences
                        </h3>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border-ink border dark:border-muted-foreground hover:bg-muted-foreground/10 dark:text-muted-foreground text-ink transition-colors">
                            Edit <Pen className="size-3" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Currency</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                {profile?.currency ?? "USD ($)"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Locale</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                {profile?.locale ?? "en-US"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Timezone</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                {profile?.timezone ?? "UTC-5 (EST)"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Date Format</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                {profile?.date_format ?? "MM/DD/YYYY"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Time Format</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200">
                                {profile?.time_format ?? "12-hour (AM/PM)"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* <div className="flex-col flex px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-6  font-mono">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Account Created At</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200 truncate">
                                {user?.created_at ? `${new Date(user.created_at).toLocaleDateString()} ${new Date(user.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', second: '2-digit', hour12: false })}` : "Not specified"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Email Confirmed At</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200 truncate">
                                {user?.email_confirmed_at ? `${new Date(user.email_confirmed_at).toLocaleDateString()} ${new Date(user.email_confirmed_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', second: '2-digit', hour12: false })}` : "Not specified"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">Last Sign In At</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200 truncate">
                                {user?.last_sign_in_at ? `${new Date(user.last_sign_in_at).toLocaleDateString()} ${new Date(user.last_sign_in_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', second: '2-digit', hour12: false })}` : "Not specified"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2">
                            <span className="text-xs text-muted-foreground font-medium">Device Type</span>
                            <span className="text-sm font-medium text-ink dark:text-zinc-200 truncate">
                                {deviceModel ? `${deviceModel.brandModel} (${deviceModel.platform} ${deviceModel.architecture} ${navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"})` : `${navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"} (Unknown Model)`}
                            </span>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

