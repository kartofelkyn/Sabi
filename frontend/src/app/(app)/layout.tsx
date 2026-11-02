import { Suspense } from "react";
import NavigationLoader from "@/components/layout/NavigationLoader";

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading application...</div>}>
      <NavigationLoader>{children}</NavigationLoader>
    </Suspense>
  );
}