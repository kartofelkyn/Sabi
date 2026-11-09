
interface DropdownOption {
    id: number;
    name: string;
}

interface DropdownProps {
    id?: string;
    name?: string;
    options: DropdownOption[];
    value: number | null;
    onChange: (value: number | null) => void;
    placeholder?: string;
    className?: string;
}

export default function Dropdown({
    id,
    name,
    options,
    value,
    onChange,
    placeholder = "Select an option",
    className = "w-40 h-10 bg-background text-foreground text-sm focus:ring-foreground/30"
}: DropdownProps) {
    return (
        <select
            name={name ?? "dropdown"}
            id={id}
            value={value ?? ""}
            onChange={(e) =>
                onChange(e.target.value === "" ? null : Number(e.target.value))
            }
            className={`
                px-3 py-2 border border-border rounded-md
                cursor-pointer focus:ring-1 focus:outline-none
                ${className}
            `}
        >
            <option value="" disabled>
                {placeholder}
            </option>
            {options.map((option) => (
                <option key={option.id} value={option.id}>
                    {option.name}
                </option>
            ))}
        </select>
    )
}