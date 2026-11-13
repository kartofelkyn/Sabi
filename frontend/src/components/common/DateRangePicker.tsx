"use client";

import { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { CalendarDays, ChevronDown } from "lucide-react";
import "react-day-picker/style.css";

interface DateRangePickerProps {
    value: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
}

export default function DateRangePicker({
    value,
    onChange
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);

    const formatDate = (date?: Date) => {
        if (!date) return "";

        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);

        return `${month}/${day}/${year}`;
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 h-10 px-3 border border-border rounded-md bg-card text-sm"
            >
                <CalendarDays size={18} className="text-muted-foreground" />

                <span>
                    {value?.from
                        ? value.to && value.to.getTime() !== value.from.getTime()
                            ? `${formatDate(value.from)} - ${formatDate(value.to)}`
                            : formatDate(value.from)
                        : "Select date"}
                </span>

                <ChevronDown size={16} />
            </button>
            {open && (
                <div className="absolute right-0 top-12 z-50 bg-card border border-border rounded-md shadow-lg p-3">

                    <DayPicker
                        mode="range"
                        selected={value}
                        onSelect={(range) => {
                            onChange(range);

                            if (
                                range?.from &&
                                range?.to &&
                                range.from.getTime() !== range.to.getTime()
                            ) {
                                setOpen(false);
                            }
                        }}
                        captionLayout="dropdown"
                        startMonth={new Date(2020, 0)}
                        endMonth={new Date()}
                        hideNavigation
                        disabled={{ after: new Date() }}
                        numberOfMonths={1}
                        classNames={{
                            root: "text-xs",
                            months: "flex",
                            month: "space-y-2 w-full",

                            // Year - Month
                            month_caption: "flex justify-end items-center h-8 w-full",
                            dropdowns: "flex flex-row-reverse items-center justify-end gap-2 w-full",
                            dropdown_root: "relative inline-flex items-center rounded-md border border-border bg-card px-2 py-1 text-xs",

                            nav: "hidden",
                            month_grid: "w-full border-collapse",

                            weekdays: "flex",
                            weekday: "w-8 text-center text-muted-foreground font-medium text-[11px]",

                            week: "flex w-full mt-1",
                            day: "w-8 h-8 text-center p-0",

                            day_button: `
                                w-8 h-8 rounded-none text-xs
                                text-foreground
                                bg-transparent border-0 shadow-none
                                hover:bg-accent hover:text-accent-foreground
                                transition-colors
                            `,

                            selected: "bg-card-secondary text-foreground",
                            range_start: "bg-card-secondary font-semibold text-foreground rounded-l-md rounded-r-none",
                            range_end: "bg-card-secondary font-semibold text-foreground rounded-r-md rounded-l-none",
                            range_middle: "bg-card-secondary text-foreground rounded-none",

                            today: "font-bold underline",
                            outside: "text-muted-foreground opacity-40",
                            disabled: "text-muted-foreground opacity-40 cursor-not-allowed",
                        }}
                    />

                </div>
            )}
        </div>
    )

}