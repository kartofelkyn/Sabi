
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
      className="
        rounded-lg
        border border-border
        bg-card
        px-3 py-2
        text-foreground
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-primary
      "
    >
      <option value="light">Light — Forest Green</option>
      <option value="neutral">Neutral — Sage & Stone</option>
      <option value="dark">Dark — French Navy</option>
    </select>
  );
}
