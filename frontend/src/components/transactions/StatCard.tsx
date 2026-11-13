type StatProps = {
    label: string;
    value: string;
    className?: string;
}

export default function StatCard({
    label,
    value,
    className = ""
}: StatProps) {
    return(
        <div className={`
              flex flex-col justify-center items-center py-1.5 px-4 min-h-12 min-w-20 rounded-md
              transition-colors border border-foreground/10 ${className}`}
        >
            <p className="text-base text-foreground font-semibold tabular-nums">
                {value}
            </p>
            <p className="text-xs text-foreground/60 font-base tracking-wide">
                {label}
            </p>
        </div>
    )
}