import * as React from "react";

import { SearchParams } from "@/shared/types/SearchParams";

import { verifyOrganizationAdminAccess } from "@/features/organization-admins/verify-access";
import { getPaginatedRoles } from "@/features/roles/api/get-paginatedRoles";
import { RolesTable } from "@/features/roles/components/table/RolesTable";
import { rolesSearchParamsCache } from "@/features/roles/schemas/get-schemas";
import { DataTableSkeleton } from "@/shared/components/custom/data-table/DataTableSkeleton";
import { auth } from "@clerk/nextjs/server";
import { Params } from "next/dist/server/request/params";
import { z } from "zod";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
  params: Promise<Params>;
}

const rolesParamsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
});

export default async function RolesPage(props: IndexPageProps) {
  await auth.protect();

  const [searchParams, params] = await Promise.all([
    props.searchParams,
    props.params,
  ]);

  const { organizationId } = rolesParamsSchema.parse(params);

  // authorization check
  await verifyOrganizationAdminAccess(organizationId);

  const search = rolesSearchParamsCache.parse(searchParams);

  const rolesPromise = getPaginatedRoles({
    ...search,
    organizationId,
  });

  return (
    <>
      <h1 className="text-3xl font-bold">Roles</h1>
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
        <RolesTable rolesPromise={rolesPromise} />
      </React.Suspense>
    </>
  );
}
