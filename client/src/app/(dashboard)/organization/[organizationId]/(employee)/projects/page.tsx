import * as React from "react";

import { verifyEmployeeAccess } from "@/features/employees/verify-access";
import { getPaginatedSelfProjects } from "@/features/projects/api/get-paginatedSelfProjects";
import { SelfProjectsTable } from "@/features/projects/components/table/SelfProjectsTable";
import {
  selfProjectsParamsSchema,
  selfProjectsSearchParamsCache,
} from "@/features/projects/schemas/get-schemas";
import { getAllSelfRoles } from "@/features/roles/api/get-allSelfRoles";
import { DataTableSkeleton } from "@/shared/components/custom/data-table/DataTableSkeleton";
import { SearchParams } from "@/shared/types/SearchParams";
import { auth } from "@clerk/nextjs/server";
import { Params } from "next/dist/server/request/params";

interface Props {
  searchParams: Promise<SearchParams>;
  params: Promise<Params>;
}

export default async function SelfProjectsPage(props: Props) {
  await auth.protect();

  const [searchParams, params] = await Promise.all([
    props.searchParams,
    props.params,
  ]);

  const { organizationId } = selfProjectsParamsSchema.parse(params);

  // authorization check
  await verifyEmployeeAccess(organizationId);

  const search = selfProjectsSearchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getPaginatedSelfProjects({ ...search, organizationId }),
    getAllSelfRoles({ organizationId }),
  ]);

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
        <SelfProjectsTable promises={promises} />
      </React.Suspense>
    </>
  );
}
