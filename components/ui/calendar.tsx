"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <div className="[&_.rdp-nav]:mr-0">
            <DayPicker
                mode="range"
                showOutsideDays={showOutsideDays}
                locale={es}
                className={cn("p-3", className)}
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    month_caption: "flex justify-center pt-1 relative items-center h-10",
                    caption_label: "text-sm font-medium",
                    button_previous: "absolute left-3 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground",
                    button_next: "absolute right-3 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground",
                    month_grid: "w-full border-collapse",
                    weekdays: "flex",
                    weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    week: "flex w-full mt-2",
                    day: "h-9 w-9 text-center text-sm p-0 relative",
                    day_button: "h-9 w-9 p-0 font-normal hover:bg-accent hover:text-accent-foreground rounded-md inline-flex items-center justify-center",
                    selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    today: "bg-accent text-accent-foreground",
                    outside: "text-muted-foreground opacity-50",
                    disabled: "text-muted-foreground opacity-50",
                    range_middle: "bg-accent text-accent-foreground",
                    range_start: "rounded-l-md",
                    range_end: "rounded-r-md",
                    hidden: "invisible",
                    ...classNames,
                }}
                components={{
                    Chevron: ({ orientation }) =>
                        orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                }}
                {...props}
            />
        </div>
    )
}
Calendar.displayName = "Calendar"

export { Calendar }