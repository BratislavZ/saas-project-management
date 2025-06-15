"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { Role } from "../types/Role";

type Props = {
  role: Role;
};

export const RoleDetails = ({ role }: Props) => {
  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-dark-900">{role.name}</h1>
        <p className="text-dark-600 text-xs">{role.description}</p>
      </div>
    </div>
  );
};

export function RoleDetailsSkeleton() {
  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
      <div className="flex flex-col gap-1">
        {/* Name skeleton */}
        <Skeleton className="h-8 w-64" />
        {/* Description skeleton */}
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}
