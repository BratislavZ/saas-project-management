import * as React from "react";

import { getAllEmployees } from "@/features/employees/api/get-allEmployees";
import AllEmployeesProvider from "@/features/employees/providers/AllEmployeesProvider ";
import { verifyOrganizationAdminAccess } from "@/features/organization-admins/verify-access";
import { getPaginatedProjects } from "@/features/projects/api/get-paginatedProjects";
import { ProjectsTable } from "@/features/projects/components/table/ProjectsTable";
import {
  projectsParamsSchema,
  projectsSearchParamsCache,
} from "@/features/projects/schemas/get-schemas";
import { getAllRoles } from "@/features/roles/api/get-allRoles";
import AllRolesProvider from "@/features/roles/providers/AllRolesProvider";
import { DataTableSkeleton } from "@/shared/components/custom/data-table/DataTableSkeleton";
import { SearchParams } from "@/shared/types/SearchParams";
import { auth } from "@clerk/nextjs/server";
import { Params } from "next/dist/server/request/params";

interface Props {
  searchParams: Promise<SearchParams>;
  params: Promise<Params>;
}

export default async function ProjectsPage(props: Props) {
  await auth.protect();

  const [searchParams, params] = await Promise.all([
    props.searchParams,
    props.params,
  ]);

  const { organizationId } = projectsParamsSchema.parse(params);

  // authorization check
  await verifyOrganizationAdminAccess(organizationId);

  const search = projectsSearchParamsCache.parse(searchParams);

  return (
    <>
      <h1 className="text-3xl font-bold">Projects</h1>
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
        <AllEmployeesProvider
          allEmployeesPromise={getAllEmployees({ organizationId })}
        >
          <AllRolesProvider allRolesPromise={getAllRoles({ organizationId })}>
            <ProjectsTable
              promise={getPaginatedProjects({ ...search, organizationId })}
            />
          </AllRolesProvider>
        </AllEmployeesProvider>
      </React.Suspense>
    </>
  );
}
