"use client";

import { useMe } from "@/features/utils/api/client-side";
import { UserButton as ClerkUserButton } from "@clerk/nextjs";
import { useMemo } from "react";

export function UserButton() {
  const { data: me } = useMe();

  const userRole = useMemo(() => {
    if (!me) return "";
    if (me.isSuperAdmin) return "Super Admin";
    if (me.isOrganizationAdmin) return "Admin";
    return "Employee";
  }, [me]);

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end">
        <p className="text-sm font-semibold text-dark-700">{me?.name}</p>
        <p className="text-xs text-dark-500">{userRole}</p>
      </div>
      <ClerkUserButton
        appearance={{
          elements: {
            userButtonAvatarBox: "h-8 w-8",
          },
        }}
      />
    </div>
  );
}
