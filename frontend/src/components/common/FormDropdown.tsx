
interface FormDropdownOption<T extends string | number> {
    value: T;
    label: string;
}

interface FormDropdownProps<T extends string | number> {
    id: string;
    name: string;
    label: string;
    options: FormDropdownOption<T>[];
    value: T | null;
    onChange: (value: T | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className: string;
}

export default function FormDropdown<T extends string | number>({
    id,
    name,
    label,
    options,
    value,
    onChange,
    placeholder = "Select an option",
    disabled = false,
    className,
}: FormDropdownProps<T>) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>

            <select
                id={id}
                name={name}
                value={value ?? ""}
                disabled={disabled}
                onChange={(e) => {
                    const selectedValue = e.target.value;

                    if (selectedValue === "") {
                        onChange(null);
                        return;
                    }

                    const option = options.find(
                        (option) => String(option.value) === selectedValue
                    );

                    onChange(option ? option.value : null);
                }}
                className={className}
            >
                <option value="">{placeholder}</option>

                {options.map((option) => (
                    <option key={String(option.value)} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
