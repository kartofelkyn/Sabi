interface UserProfileProps {
    role?: string;
    name?: string;
}

export default function UserProfile({
    role = "Administrator",
    name = "John Doe",
}: UserProfileProps) {

    const nameParts = name.trim().split(/\s+/).filter(Boolean);

    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.length > 1
        ? nameParts[nameParts.length - 1]
        : "";

    const initials = (
        firstName.charAt(0) + lastName.charAt(0)
    ).toUpperCase() || "?";

    const displayName = lastName
        ? `${lastName}, ${firstName.charAt(0)}`
        : firstName || "Unknown User";

    return (
        <div
            className="
                inline-flex items-center gap-3
                rounded-md px-2 py-1.5
                transition-colors duration-150
                hover:bg-muted
            "
        >
            <div
                className="
                    flex size-9 shrink-0
                    items-center justify-center
                    rounded-md
                    bg-primary text-primary-foreground
                    text-xs font-semibold
                    select-none
                "
            >
                {initials}
            </div>

            <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-xs leading-tight text-muted-foreground">
                    {role}
                </span>

                <span className="truncate text-sm font-medium leading-tight text-foreground">
                    {displayName}
                </span>
            </div>
        </div>
    );
}