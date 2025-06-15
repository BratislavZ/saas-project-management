"use client";

import { DataTable } from "@/shared/components/custom/data-table/DataTable";
import { useDataTable } from "@/shared/hooks/useDataTable";
import { DataTableToolbar } from "@/shared/components/custom/data-table/DataTableToolbar";
import { use, useMemo } from "react";

import { getPaginatedSelfProjects } from "../../api/get-paginatedSelfProjects";
import { getAllSelfRoles } from "@/features/roles/api/get-allSelfRoles";
import { getSelfProjectsTableColumns } from "./columns/SelfProjectsTableColumns";

interface Props {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getPaginatedSelfProjects>>,
      Awaited<ReturnType<typeof getAllSelfRoles>>
    ]
  >;
}

export function SelfProjectsTable({ promises }: Props) {
  const [{ items: data, totalPages: pageCount, totalCount }, allSelfRoles] =
    use(promises);

  const columns = useMemo(
    () => getSelfProjectsTableColumns({ roles: allSelfRoles }),
    []
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
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
