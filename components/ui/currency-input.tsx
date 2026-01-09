"use client"

import * as React from "react"
import { useCurrencyInput } from "@/lib/hooks/use-currency-input"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value?: string | number
    onValueChange?: (value: string) => void
    maxDecimals?: number
    currencySymbol?: string
    showSymbol?: boolean
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({
        value,
        onValueChange,
        maxDecimals = 2,
        currencySymbol = "$",
        showSymbol = true,
        className,
        ...props
    }, ref) => {
        const { displayValue, handleChange } = useCurrencyInput({
            initialValue: value,
            maxDecimals,
            onValueChange,
        })

        return (
            <div className="relative">
                {showSymbol && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {currencySymbol}
                    </span>
                )}
                <Input
                    ref={ref}
                    type="text"
                    inputMode="decimal"
                    value={displayValue}
                    onChange={handleChange}
                    className={cn(showSymbol && "pl-7", className)}
                    {...props}
                />
            </div>
        )
    }
)

CurrencyInput.displayName = "CurrencyInput"
