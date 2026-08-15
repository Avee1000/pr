"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
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
import { Check } from "lucide-react";


export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
    [key: string]: any;
}

export interface InputWithSelectProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    options: SelectOption[];
    prefixValue?: string;
    onPrefixChange?: (value: string) => void;
    prefixName?: string;
    prefixPlaceholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
    renderPrefix?: (option?: SelectOption) => React.ReactNode;
    containerClassName?: string;
    popoverWidth?: string;
}

export const InputWithSelect = React.forwardRef<
    HTMLInputElement,
    InputWithSelectProps
>(
    (
        {
            options,
            prefixValue,
            onPrefixChange,
            prefixName,
            prefixPlaceholder = "Code",
            searchPlaceholder = "Search country...",
            emptyMessage = "No option found.",
            renderOption,
            renderPrefix,
            containerClassName,
            popoverWidth = "w-[200px]",
            className,
            disabled = false,
            value,
            onChange,
            placeholder = "Enter phone number...",
            type = "tel",
            ...props
        },
        ref
    ) => {
        const [open, setOpen] = React.useState(false);

        const selectedOption = React.useMemo(
            () => options.find((opt) => opt.value === prefixValue),
            [options, prefixValue]
        );

        const handleSelect = React.useCallback(
            (currentValue: string) => {
                onPrefixChange?.(currentValue);
                setOpen(false);
            },
            [onPrefixChange]
        );

        return (
            <div
                className={cn(
                    "flex h-9 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background transition-colors focus-within:outline-none shadow-xs focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/35 dark:focus-within:ring-brand/40",
                    open && "border-brand ring-3 ring-brand/40 dark:ring-brand/40",
                    disabled && "cursor-not-allowed opacity-50",
                    containerClassName
                )}
            >
                {prefixName && (
                    <input type="hidden" name={prefixName} value={prefixValue || ""} />
                )}

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger render={
                        <Button
                            type="button"
                            variant="ghost"
                            role="combobox"
                            aria-expanded={open}
                            disabled={disabled}
                            className={cn(
                                "flex h-full items-center justify-center gap-1.5 rounded-r-none border-0 border-r border-input px-2 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 shrink-0 font-normal text-foreground dark:bg-muted"
                            )}
                        >
                            <div className="flex items-center gap-1.5 min-w-0">
                                {renderPrefix ? (
                                    renderPrefix(selectedOption)
                                ) : selectedOption ? (
                                    <div className="flex items-center gap-1.5 truncate">
                                        {selectedOption.flag && <span>{selectedOption.flag}</span>}
                                        <span className="truncate">{selectedOption.value}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground truncate">
                                        {prefixPlaceholder}
                                    </span>
                                )}
                            </div>

                            <ChevronDown className="size-4 shrink-0 opacity-50" />
                        </Button>
                    }>

                    </PopoverTrigger>

                    <PopoverContent className={cn("p-0", popoverWidth)} align="start">
                        <Command>
                            <CommandInput placeholder={searchPlaceholder} className="placeholder:text-xs" />
                            <CommandList>
                                <CommandEmpty>{emptyMessage}</CommandEmpty>
                                <CommandGroup>
                                    {options.map((option) => {
                                        const isSelected = prefixValue === option.value;
                                        const searchTarget = `${option.label} ${option.value} ${option.code || ""
                                            }`;

                                        return (
                                            <CommandItem
                                                key={option.value + option.label}
                                                value={searchTarget}
                                                disabled={option.disabled}
                                                onSelect={() => handleSelect(option.value)}
                                                className="flex items-center cursor-pointer"
                                            >
                                                {/* FIX 3: Removed bg-action class */}
                                                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                                                    {renderOption ? (
                                                        renderOption(option, isSelected)
                                                    ) : (
                                                        <>
                                                            <span>{option.value}</span>
                                                            <span className="text-muted-foreground truncate font-mono text-xs">
                                                                {option.label}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <Check
                                                    className={cn(
                                                        "h-4 w-4 transition-opacity",
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
                </Popover>

                <input
                    ref={ref}
                    type={type}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    maxLength={13}
                    className={cn(
                        "h-full w-full rounded-r-md bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);

InputWithSelect.displayName = "InputWithSelect";