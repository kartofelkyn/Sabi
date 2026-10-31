import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

export default function TopNav() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-topbar px-6">
      <h1 className="text-xl font-semibold">
        Sabi
      </h1>

      <ThemeSwitcher />
    </header>
  );
}