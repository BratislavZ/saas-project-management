"use client";

import { DataTable } from "@/shared/components/custom/data-table/DataTable";
import { useDataTable } from "@/shared/hooks/useDataTable";
import { DataTableToolbar } from "@/shared/components/custom/data-table/DataTableToolbar";
import { use, useMemo, useState } from "react";

import { getPaginatedSelfTickets } from "../../api/get-paginatedSelfTickets";
import { getAllSelfProjects } from "@/features/projects/api/get-allSelfProjects";
import { getSelfTicketsTableColumns } from "./columns/SelfTicketsTableColumns";
import { SelfTicket } from "../../types/SelfTicket";
import { DataTableRowAction } from "@/shared/components/custom/data-table/lib/types";
import { ViewTicketSheetWrapper } from "../sheets/ViewTicketSheetWrapper";

interface Props {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getPaginatedSelfTickets>>,
      Awaited<ReturnType<typeof getAllSelfProjects>>
    ]
  >;
}

export function SelfTicketsTable({ promises }: Props) {
  const [{ items: data, totalPages: pageCount, totalCount }, allSelfProjects] =
    use(promises);

  const [rowAction, setRowAction] =
    useState<DataTableRowAction<SelfTicket> | null>(null);

  const columns = useMemo(
    () => getSelfTicketsTableColumns({ projects: allSelfProjects }),
    [allSelfProjects]
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    rowCount: totalCount,
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable
        table={table}
        onRowClick={(row) => setRowAction({ row, variant: "seeDetails" })}
      >
        <DataTableToolbar table={table} />
      </DataTable>
      <ViewTicketSheetWrapper
        ticketId={rowAction?.row.original.id}
        projectId={rowAction?.row.original.project.id}
        open={rowAction?.variant === "seeDetails"}
        onOpenChange={() => setRowAction(null)}
      />
    </>
  );
}
