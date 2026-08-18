"use client"

import * as React from "react"
import { useState, useRef } from "react"
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { cn } from "@/lib/utils"
import useMediaQuery from "@/components/global/useMediaQuery"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
    DrawerFooter,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Loader2, UploadCloud, CheckCircle2, Loader } from "lucide-react"
import { toast } from "sonner";
import { uploadBlob } from "@/lib/account/profile/action"
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query"

interface DrawerDialogDemoProps {
    className?: string
    buttonClassName?: string
    drawerClassName?: string
}

export function DrawerDialogDemo({ className, buttonClassName, drawerClassName }: DrawerDialogDemoProps) {
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                    nativeButton={false}
                    render={
                        <Camera
                            fill="white"
                            stroke="black"
                            className="size-5 text-ink dark:text-white dark:fill-ink dark:stroke-white cursor-pointer focus:outline-none focus:ring-0 focus-visible:ring-0"
                        />
                    }
                />
                <DialogContent className={cn("sm:max-w-125 backdrop-blur-[1px]", className)}>
                    <DialogHeader>
                        <DialogTitle>Edit profile photo</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <PhotoUploadEditForm onClose={() => setOpen(false)} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
            <DrawerTrigger
                nativeButton={false}
                render={
                    <Camera
                        fill="white"
                        stroke="black"
                        className="size-5 text-ink dark:text-white dark:fill-ink dark:stroke-white cursor-pointer focus:outline-none focus:ring-0 focus-visible:ring-0"
                    />
                }
            />
            <DrawerContent className={cn(drawerClassName, "min-h-[40%] max-h-[60%]")}>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Edit profile</DrawerTitle>
                    <DrawerDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="p-4 overflow-y-auto max-h-[80vh]">
                    <PhotoUploadEditForm onClose={() => setOpen(false)} />
                </div>
                <DrawerFooter>
                    <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    )
}

interface PhotoUploadEditFormProps {
    onClose?: () => void
}

export function PhotoUploadEditForm({ onClose }: PhotoUploadEditFormProps) {
    const [imgSrc, setImgSrc] = useState("")
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [isUploading, setIsUploading] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const queryClient = useQueryClient()
    const router = useRouter()

    const handleButtonClick = () => {
        fileInputRef.current?.click();
        // setImgSrc("");
    };


    // 1. Handle file selection & validation (Client-side constraints)
    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]

            // Strict validation: max 5MB, accepted types
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size exceeds 5MB limit. Try again")
                return
            }

            const reader = new FileReader()
            reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""))
            reader.readAsDataURL(file)
        }
    }

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, 1))
    }

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!completedCrop || !imgRef.current) return

        const toastId = toast("Uploading Profile Photo...", {
            icon: <Loader className="size-4 animate-spin" />
        })

        try {
            setIsUploading(true)

            const canvas = document.createElement("canvas")
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height

            const targetSize = 800
            canvas.width = targetSize
            canvas.height = targetSize
            const ctx = canvas.getContext("2d")

            if (!ctx) throw new Error("No 2d context")

            ctx.drawImage(
                imgRef.current,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                targetSize,
                targetSize
            )

            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => (b ? resolve(b) : reject(new Error("Canvas blob creation failed"))),
                    "image/webp",
                    1
                )
            })

            const fileName = `avatar-${Date.now()}.webp`
            const res = await uploadBlob(fileName, blob)

            if (!res.success) {
                throw new Error("Couldn't update Profile Photo")
            }

            await queryClient.invalidateQueries({ queryKey: ['profile'] })

            toast.success("Profile picture updated successfully!", {
                id: toastId,
                icon: <CheckCircle2 className="size-5 text-white fill-ink" />,
                className: "!bg-background !text-foreground !border-border",
            })

            if (onClose) onClose()

        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Error uploading image. Please try again.", {
                id: toastId,
            })
        } finally {
            setIsUploading(false)
        }
    }
    return (
        <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid gap-4">
                {!imgSrc ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition">
                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                        <Label htmlFor="picture-input" className="text-sm font-medium cursor-pointer">
                            Click to browse or drag and drop
                        </Label>
                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG, or WebP</span>
                        <Input
                            id="picture-input"
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                            onChange={onSelectFile}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                        >
                            <img
                                ref={imgRef}
                                alt="Crop preview"
                                src={imgSrc}
                                onLoad={onImageLoad}
                                style={{ maxHeight: "50vh", objectFit: "contain" }}
                            />
                        </ReactCrop>
                        <div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="mt-2 text-xs"
                                onClick={handleButtonClick}
                            >
                                Choose a different image
                            </Button>
                            <Input
                                ref={fileInputRef}
                                id="picture-input"
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                onChange={onSelectFile}
                            />
                        </div>
                    </div>
                )}
            </div>

            <DialogFooter className="flex justify-end gap-2">
                <Button type="submit" disabled={!completedCrop || isUploading}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUploading ? "Uploading..." : "Save Picture"}
                </Button>
            </DialogFooter>
        </form>
    )
}

//     // Step B: Fetch Presigned URL from your backend
//     const res = await fetch("/api/upload/presign", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ contentType: "image/webp" }),
//     })
//     if (!res.ok) throw new Error("Failed to generate upload URL")
//     const { uploadUrl, fileUrl } = await res.json()

//     // Step C: Direct-to-Cloud Upload (Bypasses core app servers)
//     const uploadRes = await fetch(uploadUrl, {
//         method: "PUT",
//         headers: { "Content-Type": "image/webp" },
//         body: blob,
//     })
//     if (!uploadRes.ok) throw new Error("Cloud upload failed")

//     // Step D: Save final CDN reference URL to backend database
//     await fetch("/api/user/profile-picture", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ profilePictureUrl: fileUrl }),
//     })

//     alert("Profile picture updated successfully!")
//     if (onClose) onClose()
// } catch (error) {
//     console.error(error)
//     alert("Error uploading image. Please try again.")
// } finally {
//     setIsUploading(false)
// }