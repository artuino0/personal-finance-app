"use client"

import { useState, useCallback } from "react"

interface UseCurrencyInputProps {
    initialValue?: string | number
    maxDecimals?: number
    onValueChange?: (value: string) => void
}

export function useCurrencyInput({
    initialValue = "",
    maxDecimals = 2,
    onValueChange,
}: UseCurrencyInputProps = {}) {
    const [displayValue, setDisplayValue] = useState(() => {
        if (!initialValue) return ""
        const num = typeof initialValue === "string" ? Number.parseFloat(initialValue) : initialValue
        return Number.isNaN(num) ? "" : formatCurrency(num.toString(), maxDecimals)
    })

    const formatCurrency = useCallback((value: string, decimals: number) => {
        // Remove all non-numeric characters except decimal point
        const cleaned = value.replaceAll(/[^\d.]/g, "")

        // Split into integer and decimal parts
        const parts = cleaned.split(".")
        let integerPart = parts[0] || ""
        let decimalPart = parts[1] || ""

        // Limit decimal places
        if (decimalPart.length > decimals) {
            decimalPart = decimalPart.slice(0, decimals)
        }

        // Add thousand separators to integer part
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

        // Combine parts
        if (parts.length > 1) {
            return `${integerPart}.${decimalPart}`
        }
        return integerPart
    }, [])

    const getRawValue = useCallback((formattedValue: string): string => {
        // Remove commas to get the raw numeric value
        return formattedValue.replaceAll(",", "")
    }, [])

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target.value

            // Allow empty input
            if (input === "") {
                setDisplayValue("")
                onValueChange?.("")
                return
            }

            // Remove commas for processing
            const withoutCommas = input.replaceAll(",", "")

            // Validate input: only numbers and one decimal point
            const decimalCount = (withoutCommas.match(/\./g) || []).length
            if (decimalCount > 1) {
                return // Don't update if more than one decimal point
            }

            // Check if it's a valid number format (including incomplete like "123.")
            if (!/^\d*\.?\d*$/.test(withoutCommas)) {
                return // Don't update if invalid characters
            }

            // Format and update
            const formatted = formatCurrency(withoutCommas, maxDecimals)
            setDisplayValue(formatted)
            onValueChange?.(getRawValue(formatted))
        },
        [formatCurrency, getRawValue, maxDecimals, onValueChange]
    )

    const setValue = useCallback(
        (value: string | number) => {
            if (value === "" || value === null || value === undefined) {
                setDisplayValue("")
                return
            }
            const numValue = typeof value === "string" ? value : value.toString()
            const formatted = formatCurrency(numValue, maxDecimals)
            setDisplayValue(formatted)
        },
        [formatCurrency, maxDecimals]
    )

    return {
        displayValue,
        rawValue: getRawValue(displayValue),
        handleChange,
        setValue,
    }
}
