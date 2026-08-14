
import CustomersPage from "@/components/dashboard/customers/create/ViewPage";
import AddButton from "@/components/dashboard/customers/create/AddButton";
import Link from "next/link"
import Information from "@/components/global/Information";

export default async function CustomerFormPage() {

  return (
    <div className="dark:bg-ink min-h-screen flex-1 w-auto m-1 rounded-md shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-row justify-between w-full">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span><Link href={"/dashboard"} className="underline underline-offset-2">Dashboard</Link></span>
              <span className="text-border">/</span>
              <span className="text-foreground font-medium">Customers</span>
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              View/Create Customers <Information detail={"Edit or delete user information by using the actions tab. The actions tab should be set to visible."}/>
            </h1>
            <p className="text-muted-foreground">
              Manage Clients/Customers
            </p>
          </div>
          <AddButton />

        </div>
        <CustomersPage />
      </div>
    </div>
  );
}
