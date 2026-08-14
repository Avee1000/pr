'use client'

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CustomerForm from "./CustomerForm";
import { createCustomer } from "@/lib/customers/action";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import useMediaQuery from "@/components/global/useMediaQuery";


export default function AddButton() {
    const [isOpen, setIsOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <div className="self-center">
                    <Button onClick={() => setIsOpen(true)} className={'px-3'}><Plus />Create Customer</Button>
                </div>
                <DialogContent className="sm:max-w-150.25">
                    <CustomerForm action={createCustomer} onSuccess={()=>setIsOpen(false)}/>
                </DialogContent>
            </Dialog>
        )
    }
    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <div className="self-center">
                <Button onClick={() => setIsOpen(true)} className={'px-3'}><Plus />Create Customer</Button>
            </div>            
            <DrawerContent className={'py-5'}>
                <CustomerForm action={createCustomer}  onSuccess={()=>setIsOpen(false)}/>
            </DrawerContent>
        </Drawer>
    )
}