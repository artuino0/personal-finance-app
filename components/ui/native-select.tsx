"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode
    placeholder?: string
    onValueChange?: (value: string) => void
}

export function NativeSelect({
    children,
    placeholder,
    className,
    onValueChange,
    value,
    ...props
}: NativeSelectProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onValueChange) {
            onValueChange(e.target.value)
        }
    }

    return (
        <div className="relative">
            <select
                className={cn(
                    "border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                    className
                )}
                value={value}
                onChange={handleChange}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-50" />
        </div>
    )
}

interface NativeSelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
    children: React.ReactNode
}

export function NativeSelectItem({ children, ...props }: NativeSelectItemProps) {
    return <option {...props}>{children}</option>
}
