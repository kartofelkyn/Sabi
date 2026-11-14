"use client";

import {
    DynamicIcon as LucideDynamicIcon,
    type IconName
} from "lucide-react/dynamic";

interface DynamicIconProps {
    name: string;
    size?: number;
    className?: string;
}

export default function DynamicIcon({
    name,
    size = 20,
    className
}: DynamicIconProps) {

    const iconName = name.trim().toLowerCase() as IconName;

    return (
        <LucideDynamicIcon
            name={iconName}
            size={size}
            className={className}
        />
    );
}