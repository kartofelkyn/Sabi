export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background p-6">
      {children}
    </main>
  );
}