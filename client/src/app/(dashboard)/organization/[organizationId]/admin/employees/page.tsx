import * as React from "react";

import { DataTableSkeleton } from "@/shared/components/custom/data-table/DataTableSkeleton";
import { SearchParams } from "@/shared/types/SearchParams";

import { getPaginatedEmployees } from "@/features/employees/api/get-paginatedEmployees";
import { EmployeesTable } from "@/features/employees/components/table/EmployeesTable";
import {
  employeesParamsSchema,
  employeesSearchParamsCache,
} from "@/features/employees/schemas/get-schemas";
import { verifyOrganizationAdminAccess } from "@/features/organization-admins/verify-access";
import { getAllProjects } from "@/features/projects/api/get-allProjects";
import { getAllRoles } from "@/features/roles/api/get-allRoles";
import { auth } from "@clerk/nextjs/server";
import { Params } from "next/dist/server/request/params";

type Props = {
  searchParams: Promise<SearchParams>;
  params: Promise<Params>;
};

export default async function EmployeesPage(props: Props) {
  await auth.protect();

  const [searchParams, params] = await Promise.all([
    props.searchParams,
    props.params,
  ]);

  const { organizationId } = employeesParamsSchema.parse(params);

  // authorization check
  await verifyOrganizationAdminAccess(organizationId);

  const search = employeesSearchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getPaginatedEmployees({ ...search, organizationId }),
    getAllProjects({ organizationId, includeArchived: true }),
    getAllRoles({ organizationId }),
  ]);

  return (
    <>
      <h1 className="text-3xl font-bold">Employees</h1>
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
        <EmployeesTable promises={promises} />
      </React.Suspense>
    </>
  );
}
