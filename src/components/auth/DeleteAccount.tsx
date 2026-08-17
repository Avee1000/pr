// 'use client';

// import { DeleteAccount } from '@/lib/auth-action';
// import { useState } from 'react';
// import { useFormStatus } from 'react-dom';
// import { Trash2, LoaderIcon } from 'lucide-react';
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog"
// import { Button } from '../ui/button';

// // 1. Extract the button into a child component
// function SubmitButton() {
//     const { pending } = useFormStatus();

//     return (
//         <Button 
//             type="submit" 
//             variant="default" 
//             disabled={pending} 
//             className="w-30 text-sm bg-header font-semibold rounded-lg shadow-lg transition-all duration-200 cursor-pointer hover:bg-header"
//         >
//             {pending ? 
//             <>
//                 <LoaderIcon className="size-5 animate-spin" />
//             </> : 'Yes, Delete'}
//         </Button>
//     );
// }

// function Confirmation() {
//     // 2. Wrap the child component inside the form
//     return (
//         <form action={DeleteAccount}>
//             <div className="max-w-md w-full grid place-items-center mx-auto relative z-10">
//                 <SubmitButton />
//             </div>
//         </form>
//     )
// }

// export function DeleteButton() {
//     const [open, setOpen] = useState(false)

//     return (
//         <Dialog open={open} onOpenChange={setOpen}>
//             <DialogTrigger render={
//                 <button
//                     className="w-full flex gap-2 px-4 py-2.5 text-sm text-black hover:bg-red-50 transition-colors cursor-pointer"
//                     role="menuitem">
//                     <Trash2 className="size-4" />
//                     Delete Account
//                 </button>
//             } />
//             <DialogContent className="sm:max-w-106.25 rounded-[2.5rem] p-8"
//                 onPointerDown={(e) => e.preventDefault()}>
//                 <DialogHeader>
//                     <DialogTitle className="text-red-500 font-bold">Delete Confirmation</DialogTitle>
//                     <DialogDescription>
//                         Are you sure you want to delete your account?
//                     </DialogDescription>
//                 </DialogHeader>
//                 <Confirmation />
//             </DialogContent>
//         </Dialog>
//     );
// }