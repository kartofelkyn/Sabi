import { Suspense } from "react";
import MainLayout from "@/components/layout/MainLayout";
import NavigationLoader from "@/components/layout/NavigationLoader";

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      sidebar={
        <Suspense fallback={<div>Loading navigation...</div>}>
          <NavigationLoader />
        </Suspense>
      }
    >
      {children}
    </MainLayout>
  );
}