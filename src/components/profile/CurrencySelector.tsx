'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useCurrency } from '@/components/context/currencyContext'
import { SUPPORTED_CURRENCIES } from '@/data/currencies'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import useMediaQuery from '../global/useMediaQuery'

interface CurrencySelectorProps {
    className?: string
}

export default function CurrencySelector({ className = '' }: CurrencySelectorProps) {
    const { currency, setCurrency } = useCurrency()
    const [open, setOpen] = React.useState(false)
    const isMobile = useMediaQuery("(max-width: 768px)")


    // Find active currency object to display both code and symbol in trigger
    const selectedCurrencyObj = SUPPORTED_CURRENCIES.find(
        (item) => item.code === currency
    )

    return (
        <div className={`flex flex-col gap-2 px-2 pt-3! pb-1! text-sm ${className}`}>
            <span className="text-xs text-muted-foreground font-normal">Currency</span>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger render={<button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    className="border w-full h-8 rounded-md border-zinc-300 px-3 mt-1 text-xs font-normal text-zinc-800 transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 cursor-pointer flex items-center justify-between"
                >
                    <span className="truncate">
                        {selectedCurrencyObj
                            ? `${selectedCurrencyObj.code} (${selectedCurrencyObj.symbol})`
                            : currency}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </button>}>

                </PopoverTrigger>
                <PopoverContent
                    className="prevent-menu-close rounded-md w-(--radix-popover-trigger-width) p-0 z-60"
                    side= {isMobile ? 'bottom' : 'left'}
                    align="start"
                >
                    <Command>
                        <CommandInput placeholder="Search currency..." className="h-8 text-xs" />
                        <CommandList className="max-h-60 overflow-y-auto">
                            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                                Currency not available.
                            </CommandEmpty>
                            <CommandGroup>
                                {SUPPORTED_CURRENCIES.map((item) => (
                                    <CommandItem
                                        key={item.code}
                                        value={`${item.code} ${item.symbol}`} // Value used for searching
                                        onSelect={() => {
                                            setCurrency(item.code)
                                            setOpen(false)
                                        }}
                                        className="cursor-pointer text-xs flex items-center justify-between"
                                    >
                                        <span>
                                            {item.code} ({item.symbol})
                                        </span>
                                        <Check
                                            className={cn(
                                                'h-3.5 w-3.5',
                                                currency === item.code ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}