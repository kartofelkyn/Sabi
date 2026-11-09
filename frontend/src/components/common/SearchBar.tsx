import { Search } from "lucide-react"

interface SearchBarProps {
    className?: string;
    placeholder?: string;
}

export default function SearchBar({
    className = "w-64 h-9 ml-4",
    placeholder = "Search..."
}: SearchBarProps) {
    return (
        <div className={`relative ${className}`}>
            <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
                type="text"
                placeholder={placeholder}
                className="
                    w-full h-full
                    pl-9 pr-4 py-2
                    border border-border
                    rounded-md
                    bg-background
                    text-foreground
                    placeholder:text-muted-foreground
                    focus:outline-none
                    focus:ring-1
                    focus:ring-foreground/30
                    focus:border-foreground/30
                    transition-colors
                "
            />
        </div>
    )
}