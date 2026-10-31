export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-w-0 flex-1 bg-background p-6">
      {children}
    </main>
  );
}