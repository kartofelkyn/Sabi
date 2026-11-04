
interface SummaryCardProps {
    title: string;
    value: string;
    description?: string;
}

export default function SummaryCard({
    title,
    value,
    description
}: SummaryCardProps) {
    return (
        <div className="summary-card min-h-28 p-4 bg-card-secondary/80 rounded-sm">
            <p className="text-sm text-muted-foreground">{title}</p>

            <p className="text-2xl font-semibold text-foreground">
                {value}
            </p>
            {description && (
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    )
}