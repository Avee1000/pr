import React from "react";
import { MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuGroup,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KebabMenuProps {
    children: React.ReactNode;
    afterSeparator?: React.ReactNode;
    align?: "start" | "center" | "end";
    className?: string;
    contentClassName?: string; // Appended to DropdownMenuContent
    groupClassName?: string; // Appended to DropdownMenuGroup
    triggerClassName?: string; // Appended to DropdownMenuTrigger button
}

export function KebabMenu({
    children,
    afterSeparator,
    align = "end",
    className,
    contentClassName,
    groupClassName,
    triggerClassName,
}: KebabMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8 p-0 text-muted-foreground hover:text-foreground focus-visible:ring-1",
                        triggerClassName
                    )}
                    aria-label="Open menu"
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            }>

            </DropdownMenuTrigger>

            <DropdownMenuContent align={align} className={cn(contentClassName)}>
                <DropdownMenuGroup className={cn(groupClassName)}>{children}</DropdownMenuGroup>

                {afterSeparator && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="w-full *:w-full">
                            {afterSeparator}
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}