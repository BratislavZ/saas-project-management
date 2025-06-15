"use client";

import { DataTable } from "@/shared/components/custom/data-table/DataTable";
import { DataTableRowAction } from "@/shared/components/custom/data-table/lib/types";
import { getOrganizationAdminsTableColumns } from "./columns/OrganizationAdminsTableColumns";
import { useDataTable } from "@/shared/hooks/useDataTable";
import { DataTableToolbar } from "@/shared/components/custom/data-table/DataTableToolbar";
import { use, useMemo, useState } from "react";
import { AddOrganizationAdminDialog } from "../dialogs/AddOrganizationAdminDialog";
import { EditOrganizationAdminDialogWrapper } from "../dialogs/EditOrganizationAdminDialogWrapper";

import { getPaginatedOrganizationAdmins } from "../../api/get-paginatedOrganizationAdmins";
import { OrganizationAdmin } from "../../types/OrganizationAdmin";
import { getAllOrganizations } from "@/features/organizations/api/get-allOrganizations";
import { BanOrganizationAdminDialog } from "../dialogs/BanOrganizationAdminDialog";
import { ActivateOrganizationAdminDialog } from "../dialogs/ActivateOrganizationAdminDialog";

interface Props {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getPaginatedOrganizationAdmins>>,
      Awaited<ReturnType<typeof getAllOrganizations>>
    ]
  >;
}

export function OrganizationAdminsTable({ promises }: Props) {
  const [{ items: data, totalPages: pageCount, totalCount }, allOrganizations] =
    use(promises);

  const [rowAction, setRowAction] =
    useState<DataTableRowAction<OrganizationAdmin> | null>(null);

  const columns = useMemo(
    () =>
      getOrganizationAdminsTableColumns({
        setRowAction,
        organizations: allOrganizations,
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
          <AddOrganizationAdminDialog organizations={allOrganizations} />
        </DataTableToolbar>
      </DataTable>
      <EditOrganizationAdminDialogWrapper
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
        organizationAdminId={rowAction?.row.original.id}
        organizations={allOrganizations}
      />
      <BanOrganizationAdminDialog
        open={rowAction?.variant === "ban"}
        onOpenChange={() => setRowAction(null)}
        organizationAdminId={rowAction?.row.original.id}
      />
      <ActivateOrganizationAdminDialog
        open={rowAction?.variant === "activate"}
        onOpenChange={() => setRowAction(null)}
        organizationAdminId={rowAction?.row.original.id}
      />
    </>
  );
}
