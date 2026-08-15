"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
    [key: string]: any; // Allows custom metadata
}

export interface SelectPopoverProps {
    name?: string;
    options: SelectOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    clearable?: boolean;
    className?: string;
    icon?: React.ReactNode;
    /** Custom renderer for item content in the list */
    renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
}

export function SelectPopover({
    name,
    options,
    value,
    onChange,
    placeholder = "Select an option...",
    searchPlaceholder = "Search options...",
    emptyMessage = "No option found.",
    disabled = false,
    clearable = true,
    className,
    icon,
    renderOption,
}: SelectPopoverProps) {
    const [open, setOpen] = React.useState(false);

    // Find current selected option object
    const selectedOption = React.useMemo(
        () => options.find((opt) => opt.value === value),
        [options, value]
    );

    const handleSelect = React.useCallback(
        (currentValue: string) => {
            // Toggle off if same value selected, or assign new value
            const newValue = currentValue === value ? "" : currentValue;
            onChange(newValue);
            setOpen(false);
        },
        [onChange, value]
    );

    const handleClear = React.useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange("");
            setOpen(false);
        },
        [onChange]
    );

    return (
        <>
            {name && <input type="hidden" name={name} value={value || ""} required />}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger render={
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                            "w-full justify-between font-normal transition-all shadow-xs focus-visible:border-ring  focus-visible:ring-3 focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/35 dark:focus-within:ring-brand/40",
                            open && "border-brand focus-within:border-brand ring-3 ring-brand/40 dark:ring-brand/40",
                            !selectedOption && "text-muted-foreground",
                            className
                        )}
                    >
                        <span className="truncate">
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                            {clearable && selectedOption && !disabled && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={handleClear}
                                    className="rounded-sm p-0.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </span>
                            )}
                            {icon ?? <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
                        </div>
                    </Button>
                }>

                </PopoverTrigger>


                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => {
                                    const isSelected = value === option.value;
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            value={option.label} // Command searches against this value
                                            disabled={option.disabled}
                                            onSelect={() => handleSelect(option.value)}
                                            className="flex items-center justify-between cursor-pointer"
                                        >
                                            <span className="truncate">
                                                {renderOption
                                                    ? renderOption(option, isSelected)
                                                    : option.label}
                                            </span>
                                            <Check
                                                className={cn(
                                                    "ml-2 h-4 w-4 shrink-0 transition-opacity",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover >
        </>
    );
}