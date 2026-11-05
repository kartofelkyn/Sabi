import { FileDown } from "lucide-react";

interface ExportButtonProps {
    className?: string;
    parentClassName?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export default function ExportButton({
    className = "size-5",
    parentClassName = "h-9 px-3",
    onClick,
    disabled = false,
}: ExportButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`
                inline-flex shrink-0 items-center justify-center gap-2
                rounded-md border border-primary
                bg-primary text-primary-foreground
                text-sm font-medium
                transition-colors duration-150

                hover:bg-primary/90
                active:bg-primary/80

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
                focus-visible:ring-offset-2
                focus-visible:ring-offset-background

                disabled:pointer-events-none
                disabled:opacity-50

                ${parentClassName}
            `}
        >
            <FileDown
                strokeWidth={1.75}
                className={className}
                aria-hidden="true"
            />

            <span className="hidden lg:inline">Export</span>
        </button>
    );
}