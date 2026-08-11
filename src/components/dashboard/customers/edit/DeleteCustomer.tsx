'use Client'

import { useState } from "react";
import { toast } from "sonner";
import { deleteCustomer } from "@/lib/customers/action";
import { Trash2 } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
interface DeleteProps {
    label?: string;
    id: string | number;
}

export default function Delete({ id, label }: DeleteProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        if (isDeleting) return;
        try {
            const promise = async () => {
                const res = await deleteCustomer(id);
                if (!res.success) {
                    throw new Error(res.message || "Failed to delete order");
                }
                setIsDeleting(false);
                setIsOpen(false);
                return res;
            };

            await toast.promise(promise(), {
                loading: "Deleting Customer...",
                success: "Customer deleted successfully!",
                error: (err) => err.message || "Failed to delete Customer. Please try again.",
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="inline-flex">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger render={<button
                    style={{ color: '#FF4A3C' }}
                    className={`inline-flex items-center w-full gap-1.5 rounded-lg hover:bg-action/20 transition-all disabled:opacity-50 text-xs font-medium ${label ? "h-7 px-3 justify-start" : " justify-center size-7"
                        }`}
                    title="Delete Order"
                >
                    <Trash2 className="size-3.5" />
                    {label && <span>{label}</span>}
                </button>} />
                <PopoverContent>
                    <PopoverHeader>
                        <PopoverTitle>Are you sure you want to delete this customer?</PopoverTitle>
                        <PopoverDescription>
                            This action cannot be undone.
                        </PopoverDescription>
                    </PopoverHeader>
                    <div className="flex gap-2 justify-center">
                        <Button
                            onClick={() => setIsOpen(false)}
                            variant={"outline"}
                            className={"bg-white px-5"}
                            disabled={isDeleting}>No</Button>
                        <Button variant={"destructive"}
                            className={"bg-action text-white border-action px-5"}
                            disabled={isDeleting}
                            onClick={() => {
                                setIsDeleting(true)
                                handleDelete()
                            }}>Yes</Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}