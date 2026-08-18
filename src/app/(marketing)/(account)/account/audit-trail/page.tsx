import { LogsIcon } from "lucide-react";
import DeviceAndSessionsPage from "@/components/accounts/audit-trail/DeviceAndSessions";

export default function ProfilePage() {
    return (
        <div className="min-h-screen">
            <div className=" h-auto sm:max-w-4xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col space-y-8 my-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground max-sm:mx-3">
                        <span>My Account</span>
                        <span className="text-border">/</span>
                        <span className="text-foreground font-normal flex justify-center items-center gap-1"><LogsIcon className="size-4 inline-flex " />Audit Trail</span>
                    </div>

                    <div className="mx-3">
                        <DeviceAndSessionsPage 
                            // onRevokeSession={(sessionId) => { /* Implement session revocation logic here */ }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}