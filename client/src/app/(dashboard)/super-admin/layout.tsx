import { SuperAdminNav } from "@/features/super-admins/components/SuperAdminNav";
import { DashboardHeader } from "@/shared/components/custom/Header";
import { Shell } from "@/shared/components/custom/Shell";
import React, { PropsWithChildren } from "react";

export default function SuperAdminLayout({ children }: PropsWithChildren) {
  return (
    <>
      <DashboardHeader>
        <SuperAdminNav />
      </DashboardHeader>
      <Shell>{children}</Shell>
    </>
  );
}
