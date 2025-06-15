"use client";

import { DataTable } from "@/shared/components/custom/data-table/DataTable";
import { useDataTable } from "@/shared/hooks/useDataTable";
import { DataTableToolbar } from "@/shared/components/custom/data-table/DataTableToolbar";
import { use, useMemo } from "react";
import { CreateRoleDialog } from "../dialogs/CreateRoleDialog";

import { getPaginatedRoleMembers } from "../../api/get-paginatedRoleMembers";
import { getRoleMembersTableColumns } from "./columns/RoleMembersTableColumns";

interface Props {
  roleMembersPromise: Promise<
    Awaited<ReturnType<typeof getPaginatedRoleMembers>>
  >;
}

export function RoleEmployeesTable({ roleMembersPromise }: Props) {
  const {
    items: data,
    totalPages: pageCount,
    totalCount,
  } = use(roleMembersPromise);

  const columns = useMemo(() => getRoleMembersTableColumns(), []);

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
      <DataTable table={table}>
        <DataTableToolbar table={table} className="pt-0" />
      </DataTable>
    </>
  );
}
