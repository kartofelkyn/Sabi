export function Spinner() {
    return (
        <svg
            className="h-10 w-10 animate-spin text-primary"
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
            />
            <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function CheckIcon() {
    return (
        <svg
            className="h-12 w-12 text-income animate-[pop_0.3s_ease-out]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-6" />
        </svg>
    );
}

export function ErrorIcon() {
    return (
        <svg
            className="h-12 w-12 text-expense animate-[pop_0.3s_ease-out]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6m0-6l6 6" />
        </svg>
    );
}