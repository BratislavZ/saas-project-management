import * as React from "react";

import { SearchParams } from "@/shared/types/SearchParams";

import { DataTableSkeleton } from "@/shared/components/custom/data-table/DataTableSkeleton";

import { verifyOrganizationAdminAccess } from "@/features/organization-admins/verify-access";
import { getPaginatedRoleMembers } from "@/features/roles/api/get-paginatedRoleMembers";
import { RoleDetails } from "@/features/roles/components/RoleDetails";
import RoleNavigationPanel from "@/features/roles/components/RoleNavigationPanel";
import { RoleEmployeesTable } from "@/features/roles/components/table/RoleEmployeesTable";
import { roleEmployeesSearchParamsCache } from "@/features/roles/schemas/get-schemas";
import { verifyRoleIdValid } from "@/features/roles/verify-access";
import { auth } from "@clerk/nextjs/server";
import { Params } from "next/dist/server/request/params";
import { z } from "zod";

type PageProps = {
  searchParams: Promise<SearchParams>;
  params: Promise<Params>;
};

const roleMembersParamsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
  roleId: z.coerce.number().int().positive(),
});

export default async function RoleIdEmployeesPage(props: PageProps) {
  await auth.protect();

  const [searchParams, params] = await Promise.all([
    props.searchParams,
    props.params,
  ]);
  const { organizationId, roleId } = roleMembersParamsSchema.parse(params);

  // authorization check
  await verifyOrganizationAdminAccess(organizationId);
  // ensure roleId is valid
  const { role } = await verifyRoleIdValid({
    organizationId,
    roleId,
  });

  const search = roleEmployeesSearchParamsCache.parse(searchParams);

  return (
    <main className="grid grid-cols-4 gap-4">
      <div className="col-span-1 border h-fit overflow-hidden border-border shadow-card rounded-xl">
        <RoleDetails role={role} />
        <RoleNavigationPanel />
      </div>
      <div className="col-span-3">
        <React.Suspense
          fallback={
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
          }
        >
          <RoleEmployeesTable
            roleMembersPromise={getPaginatedRoleMembers({
              ...search,
              organizationId,
              roleId,
            })}
          />
        </React.Suspense>
      </div>
    </main>
  );
}
