import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import ProfileInformation from "@/components/accounts/profile/Profile";

export default function ProfilePage() {
    return (
        <div className="min-h-screen">
            <div className=" h-auto sm:max-w-4xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col space-y-8 my-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground max-sm:mx-3">
                        <span>My Account</span>
                        <span className="text-border">/</span>
                        <span className="text-foreground font-normal flex justify-center items-center gap-1"><UserCircle2 className="size-4 inline-flex" />Profile</span>
                    </div>

                    <div className="mx-3">
                        <ProfileInformation />
                    </div>
                </div>
            </div>
        </div>
    )
}