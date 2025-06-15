import { RoleDetailsSkeleton } from "@/features/roles/components/RoleDetails";
import { DataTableSkeleton } from "@/shared/components/custom/data-table/DataTableSkeleton";
import { Skeleton } from "@/shared/components/ui/skeleton"; // Adjust import path as needed

function RoleCardSkeleton() {
  return (
    <div className="col-span-1 border h-fit overflow-hidden border-border shadow-card rounded-xl">
      {/* RoleDetails skeleton */}
      <RoleDetailsSkeleton />

      {/* RoleNavigationPanel skeleton */}
      <div className="p-4 bg-white">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="grid grid-cols-4 gap-4">
      {/* Left sidebar skeleton */}
      <RoleCardSkeleton />

      {/* Right content skeleton */}
      <div className="col-span-3">
        {/* DataTable skeleton */}
        <DataTableSkeleton
          columnCount={7}
          filterCount={2}
          cellWidths={[
            "10rem",
            "30rem",
            "10rem",
            "10rem",
            "6rem",
            "6rem",
            "6rem",
          ]}
          shrinkZero
        />
      </div>
    </main>
  );
}
