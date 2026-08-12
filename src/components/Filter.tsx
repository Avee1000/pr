'use client';

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FilterOption {
    value: string;
    label?: string;
}

interface FilterConfig {
    label: string;
    name: string;
    id: string;
    options: FilterOption[];
}

interface FilterProps {
    filters: FilterConfig[];
}

export default function Filter({ filters }: FilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleValueChange = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleReset = () => {
        const params = new URLSearchParams(searchParams.toString());
        filters.forEach((filter) => params.delete(filter.name));
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 mx-auto p-2 rounded-xl">
            {filters?.map((filter) => {
                let value;
                const currentValue = searchParams.get(filter.name) ?? "";
                if (currentValue.includes("_")) {
                    value = currentValue
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, char => char.toUpperCase());
                    // value = currentValue
                    //     .split("_")
                    //     .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    //     .join(" ");
                } else {
                    value = currentValue.charAt(0).toUpperCase() + currentValue.slice(1);
                }
                return (
                    <div key={filter.id || filter.name} className="flex flex-col">
                        <label htmlFor={filter.id} className="sr-only">
                            {filter.label}
                        </label>
                        <Select
                            value={value}
                            onValueChange={(value) => handleValueChange(filter.name, value as string)}
                        >
                            <SelectTrigger id={filter.id} className="w-full bg-white dark:bg-ink">
                                <SelectValue placeholder={filter.label} />
                            </SelectTrigger>
                            <SelectContent>
                                {filter.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label || option.value.charAt(0).toUpperCase() + option.value.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );
            })}

            <div className="flex flex-col">
                <button
                    type="button"
                    onClick={handleReset}
                    className="bg-white dark:bg-ink flex items-center justify-between w-full h-10 px-4 py-2 rounded-lg border border-border shadow-sm hover:bg-muted text-sm font-medium outline-none hover:cursor-pointer dark:text-muted-foreground"
                >
                    <span>Reset filters</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" className="w-4 h-4 ml-2 text-muted-foreground" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                    </svg>
                </button>
            </div>
        </div>
    );
}