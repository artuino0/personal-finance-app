/**
 * Format a number as currency with US locale (1,000.00)
 * @param value - The number to format
 * @param options - Optional Intl.NumberFormatOptions
 * @returns Formatted currency string
 */
export function formatCurrency(
    value: number | string,
    options?: Intl.NumberFormatOptions
): string {
    const numValue = typeof value === "string" ? Number.parseFloat(value) : value

    if (Number.isNaN(numValue)) {
        return "0.00"
    }

    return numValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
    })
}

/**
 * Format a number as currency with currency symbol
 * @param value - The number to format
 * @param currencySymbol - Currency symbol (default: $)
 * @param options - Optional Intl.NumberFormatOptions
 * @returns Formatted currency string with symbol
 */
export function formatCurrencyWithSymbol(
    value: number | string,
    currencySymbol = "$",
    options?: Intl.NumberFormatOptions
): string {
    return `${currencySymbol}${formatCurrency(value, options)}`
}
