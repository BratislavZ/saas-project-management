import { EmployeeNav } from "@/features/employees/components/EmployeeNav";
import { OrganizationAdminNav } from "@/features/organization-admins/components/OrganizationAdminNav";
import { getMe } from "@/features/utils/api/get-me";
import { DashboardHeader } from "@/shared/components/custom/Header";
import { Shell } from "@/shared/components/custom/Shell";
import React, { PropsWithChildren } from "react";

export default async function OrganizationLayout({
  children,
}: PropsWithChildren) {
  const me = await getMe();

  return (
    <>
      <DashboardHeader>
        {me?.isOrganizationAdmin ? <OrganizationAdminNav /> : <EmployeeNav />}
      </DashboardHeader>
      <Shell>{children}</Shell>
    </>
  );
}
