import * as React from "react";

import { getPaginatedOrganizationAdmins } from "@/features/organization-admins/api/get-paginatedOrganizationAdmins";
import { OrganizationAdminsTable } from "@/features/organization-admins/components/table/OrganizationAdminsTable";
import { searchParamsCache } from "@/features/organization-admins/schemas/get-schemas";
import { getAllOrganizations } from "@/features/organizations/api/get-allOrganizations";
import { verifySuperAdminAccess } from "@/features/super-admins/verify-access";
import { DataTableSkeleton } from "@/shared/components/custom/data-table/DataTableSkeleton";
import { SearchParams } from "@/shared/types/SearchParams";
import { auth } from "@clerk/nextjs/server";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function OrganizationAdminsPage(props: Props) {
  await auth.protect();

  await verifySuperAdminAccess();

  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getPaginatedOrganizationAdmins(search),
    getAllOrganizations(),
  ]);

  return (
    <>
      <h1 className="text-3xl font-bold">Admins</h1>
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
        <OrganizationAdminsTable promises={promises} />
      </React.Suspense>
    </>
  );
}
