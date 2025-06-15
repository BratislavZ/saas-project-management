import * as React from "react";

import { getPaginatedOrganizations } from "@/features/organizations/api/get-paginatedOrganizations";
import { OrganizationsTable } from "@/features/organizations/components/table/OrganizationsTable";
import { organizationAdminsSearchParamsCache } from "@/features/organizations/schemas/get-schemas";
import { verifySuperAdminAccess } from "@/features/super-admins/verify-access";
import { DataTableSkeleton } from "@/shared/components/custom/data-table/DataTableSkeleton";
import { SearchParams } from "@/shared/types/SearchParams";
import { auth } from "@clerk/nextjs/server";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function OrganizationsPage(props: IndexPageProps) {
  await auth.protect();

  await verifySuperAdminAccess();

  const searchParams = await props.searchParams;
  const search = organizationAdminsSearchParamsCache.parse(searchParams);

  const organizationPromise = getPaginatedOrganizations(search);

  return (
    <>
      <h1 className="text-3xl font-bold">Organizations</h1>
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
        <OrganizationsTable organizationsPromise={organizationPromise} />
      </React.Suspense>
    </>
  );
}
