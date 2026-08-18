'use client';

import * as React from 'react';
import Image from 'next/image';
import { Loader2, AlertCircle, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface ProfileImageModalProps {
    photoUrl: string;
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
}

export default function ProfileImageModal({
    photoUrl,
    isOpen,
    onClose,
    userName = "User"
}: ProfileImageModalProps) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);

    // Reset states reliably when modal state or URL shifts
    React.useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setHasError(false);
        }
    }, [isOpen, photoUrl]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="max-w-[95vw] max-h-[95vh] w-auto h-auto bg-transparent p-0 flex flex-col items-center justify-center shadow-none focus:outline-none overflow-visible select-none"
                aria-describedby="profile-modal-description"
            >
                <DialogTitle className="sr-only">
                    {userName}&apos;s Profile Picture Viewer
                </DialogTitle>
                <DialogDescription id="profile-modal-description" className="sr-only">
                    Interactive modal previewing {userName}&apos;s profile avatar.
                </DialogDescription>

                <div className="relative flex flex-col items-center">
                    
                    {!isLoading && !hasError && (
                        <div className="absolute -top-14 right-0 z-40 flex items-center bg-zinc-950/70 border  hover:-translate-y-0.5 transition-all  active:translate-y-0 border-white/10  p-1.5 rounded-full shadow-2xl duration-200 ease-ou">
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-white/80 hover:text-white bg-transparent  rounded-full p-2 t focus:outline-none"
                                aria-label="Close dialog"
                            >
                                <X className="w-4 h-4 stroke-[2.5]" />
                            </button>
                        </div>
                    )}

                    <div className="relative flex items-center justify-center p-1">
                        {isLoading && !hasError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/60 backdrop-blur-md rounded-2xl z-20">
                                <Loader2 className="w-7 h-7 text-white/90 animate-spin" />
                                <span className="text-[11px] font-medium text-white/60 tracking-wider uppercase mt-2">
                                    Loading...
                                </span>
                            </div>
                        )}

                        {hasError ? (
                            <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-900/90 backdrop-blur-md rounded-2xl text-white/90 space-y-3 shadow-2xl">
                                <AlertCircle className="w-10 h-10 text-rose-400 stroke-[1.5]" />
                                <p className="text-sm font-medium">Failed to load image asset</p>
                                <p className="text-xs text-white/50">Please check your network connectivity.</p>
                            </div>
                        ) : (
                            <div
                                className={`relative flex items-center justify-center transition-opacity duration-300 ease-out ${
                                    isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                                }`}
                            >
                                <Image
                                    src={photoUrl}
                                    alt={`${userName} profile picture`}
                                    width={400}
                                    height={400}
                                    quality={100}
                                    priority
                                    onLoad={() => setIsLoading(false)}
                                    onError={() => {
                                        setIsLoading(false);
                                        setHasError(true);
                                    }}
                                    className="object-contain rounded-2xl shadow-2xl will-change-transform max-h-[70vh] max-w-[80vw] w-auto h-auto"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}