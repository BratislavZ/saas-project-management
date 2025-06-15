"use client";

import { DataTable } from "@/shared/components/custom/data-table/DataTable";
import { DataTableRowAction } from "@/shared/components/custom/data-table/lib/types";
import { getRolesTableColumns } from "./columns/RolesTableColumns";
import { useDataTable } from "@/shared/hooks/useDataTable";
import { DataTableToolbar } from "@/shared/components/custom/data-table/DataTableToolbar";
import { use, useMemo, useState } from "react";
import { CreateRoleDialog } from "../dialogs/CreateRoleDialog";
import { EditRoleDialogWrapper } from "../dialogs/EditRoleDialogWrapper";

import { getPaginatedRoles } from "../../api/get-paginatedRoles";
import { Role } from "../../types/Role";
import { DeleteRoleDialog } from "../dialogs/DeleteRoleDialog";

interface Props {
  rolesPromise: Promise<Awaited<ReturnType<typeof getPaginatedRoles>>>;
}

export function RolesTable({ rolesPromise }: Props) {
  const { items: data, totalPages: pageCount, totalCount } = use(rolesPromise);

  const [rowAction, setRowAction] = useState<DataTableRowAction<Role> | null>(
    null
  );

  const columns = useMemo(
    () =>
      getRolesTableColumns({
        setRowAction,
      }),
    []
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    rowCount: totalCount,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <CreateRoleDialog />
        </DataTableToolbar>
      </DataTable>
      <EditRoleDialogWrapper
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
        roleId={rowAction?.row.original.id}
      />
      <DeleteRoleDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        roleId={rowAction?.row.original.id}
      />
    </>
  );
}
