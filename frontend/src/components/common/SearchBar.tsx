interface SearchBarProps {
    className?: string;
    placeholder?: string;
}

export default function SearchBar({
    className = "w-64 h-9 ml-4",
    placeholder = "Search..."
}: SearchBarProps) {
    return (
        <input
            type="text"
            placeholder={placeholder}
            className={`
                px-4 py-2 border rounded-md  focus:outline-none focus:ring-1 focus:border-muted-foreground/10
                ${className}
            `}
        />
    )
}