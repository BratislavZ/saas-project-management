"use client";

import { useProjectAuthorization } from "@/features/projects/providers/ProjectAuthProvider";
import { Permission } from "@/features/roles/types/Permission";
import { FC, ReactNode } from "react";

// --- Using 'type' and full prop name as requested ---
type CanProps = {
  children: ReactNode;
  permission: Permission["code"];
  fallback?: ReactNode;
};

export const Can: FC<CanProps> = ({
  children,
  permission,
  fallback = null,
}) => {
  const auth = useProjectAuthorization();

  // If the user has permission, render the children. Otherwise, hide it.
  return auth.can(permission) ? <>{children}</> : <>{fallback}</>;
};
