import * as React from "react";

import { verifyEmployeeAccess } from "@/features/employees/verify-access";
import { getAllSelfProjects } from "@/features/projects/api/get-allSelfProjects";
import { getPaginatedSelfTickets } from "@/features/tickets/api/get-paginatedSelfTickets";
import { SelfTicketsTable } from "@/features/tickets/components/tables/SelfTicketsTable";
import {
  selfTicketsParamsSchema,
  selfTicketsSearchParamsCache,
} from "@/features/tickets/schemas/get-schemas";
import { DataTableSkeleton } from "@/shared/components/custom/data-table/DataTableSkeleton";
import { SearchParams } from "@/shared/types/SearchParams";
import { auth } from "@clerk/nextjs/server";
import { Params } from "next/dist/server/request/params";

interface Props {
  searchParams: Promise<SearchParams>;
  params: Promise<Params>;
}

export default async function SelfTicketsPage(props: Props) {
  await auth.protect();

  const [searchParams, params] = await Promise.all([
    props.searchParams,
    props.params,
  ]);

  const { organizationId } = selfTicketsParamsSchema.parse(params);

  // authorization check
  await verifyEmployeeAccess(organizationId);

  const search = selfTicketsSearchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getPaginatedSelfTickets({ ...search, organizationId }),
    getAllSelfProjects({ organizationId }),
  ]);

  return (
    <>
      <h1 className="text-3xl font-bold">Tickets</h1>
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
        <SelfTicketsTable promises={promises} />
      </React.Suspense>
    </>
  );
}
