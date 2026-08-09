import EditCustomersPage from "@/components/dashboard/customers/edit/ViewPage";
import Link from "next/link"

export default async function CustomerFormPage({ params }: { params: Promise<{ id?: string }> }) {

    return (
        <div className="dark:bg-ink min-h-screen flex-1 w-auto m-1 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="flex flex-row justify-between w-full">
                    <div className="mb-8">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <span><Link href={"/dashboard"} className="underline underline-offset-2">Dashboard</Link></span>
                            <span className="text-border">/</span>
                            <span className="text-muted-foreground font-medium">
                                <Link href={"/dashboard/customers"} className="underline underline-offset-2">Customers</Link></span>
                            <span className="text-border">/</span>
                            <span className="text-foreground items-center">Edit</span>
                        </div>

                        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                            Edit Customers
                        </h1>
                        <p className="text-muted-foreground">
                            Update with Clients/Customers with desired information
                        </p>
                    </div>
                </div>
                <EditCustomersPage params={params} />
            </div>
        </div>
    );
}
