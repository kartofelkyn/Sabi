
"use client";

import { useTheme } from "@/providers/ThemeProvider";
import type { Theme } from "@/types/theme";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(event) =>
        setTheme(event.target.value as Theme)
      }
      aria-label="Select appearance"
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

                px-3 py-2
            `}
    >
      <option value="light">Light</option>
      <option value="neutral">Neutral</option>
      <option value="dark">Dark</option>
    </select>
  );
}
