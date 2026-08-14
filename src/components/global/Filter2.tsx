'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { Select,  } from "../ui/select";

interface FilterOption {
    value: string;
    label?: string; // Optional custom display label
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

    // Handle change by updating URL search parameters
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Handle reset by clearing filter-related search params
    const handleReset = () => {
        const params = new URLSearchParams(searchParams.toString());
        filters.forEach((filter) => params.delete(filter.name));
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 mx-auto p-2 rounded-xl">
            {filters?.map((filter) => {
                const currentValue = searchParams.get(filter.name) || "";
                console.log(currentValue)
                return (
                    <div key={filter.id || filter.name} className="relative flex flex-col bg-white dark:bg-ink rounded-lg border border-border shadow-sm hover:bg-muted">
                        <label htmlFor={filter.id} className="sr-only">
                            {filter.label}
                        </label>
                        <select
                            name={filter.name}
                            value={currentValue}
                            id={filter.id}
                            onChange={handleChange}
                            className="appearance-none w-full text-foreground dark:text-muted-foreground text-sm font-medium px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-ring bg-transparent cursor-pointer"
                        >
                            <option value="" disabled hidden>{filter.label}</option>
                            {filter.options?.map((option) => (
                                <option className="dark:text-black" key={option.value} value={option.value}>
                                    {option.label || option.value.charAt(0).toUpperCase() + option.value.slice(1)}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                );
            })}
            
            <div className="relative flex flex-col rounded-lg border border-border shadow-sm">
                <button
                    type="button"
                    onClick={handleReset}
                    className="bg-white dark:bg-ink flex items-center justify-between w-full sm:w-auto px-4 py-2 rounded-lg border border-border shadow-sm hover:bg-muted text-sm font-medium outline-none hover:cursor-pointer dark:text-muted-foreground"
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