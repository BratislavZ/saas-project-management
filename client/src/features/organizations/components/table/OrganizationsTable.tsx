"use client";

import { DataTable } from "@/shared/components/custom/data-table/DataTable";
import { DataTableRowAction } from "@/shared/components/custom/data-table/lib/types";
import { Organization } from "../../types/Organization";
import { getOrganizationsTableColumns } from "./columns/OrganizationsTableColumns";
import { useDataTable } from "@/shared/hooks/useDataTable";
import { getPaginatedOrganizations } from "../../api/get-paginatedOrganizations";
import { DataTableToolbar } from "@/shared/components/custom/data-table/DataTableToolbar";
import { use, useMemo, useState } from "react";
import { AddOrganizationDialog } from "../dialogs/AddOrganizationDialog";
import { EditOrganizationDialogWrapper } from "../dialogs/EditOrganizationDialogWrapper";
import { BanOrganizationDialog } from "../dialogs/BanOrganizationDialog";

import { ActivateOrganizationDialog } from "../dialogs/ActivateOrganizationDialog";

interface Props {
  organizationsPromise: Promise<
    Awaited<ReturnType<typeof getPaginatedOrganizations>>
  >;
}

export function OrganizationsTable({ organizationsPromise }: Props) {
  const {
    items: data,
    totalPages: pageCount,
    totalCount,
  } = use(organizationsPromise);

  const [rowAction, setRowAction] =
    useState<DataTableRowAction<Organization> | null>(null);

  const columns = useMemo(
    () =>
      getOrganizationsTableColumns({
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
          <AddOrganizationDialog />
        </DataTableToolbar>
      </DataTable>
      <EditOrganizationDialogWrapper
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
        organizationId={rowAction?.row.original.id}
      />
      <BanOrganizationDialog
        open={rowAction?.variant === "ban"}
        onOpenChange={() => setRowAction(null)}
        organizationId={rowAction?.row.original.id}
      />
      <ActivateOrganizationDialog
        open={rowAction?.variant === "activate"}
        onOpenChange={() => setRowAction(null)}
        organizationId={rowAction?.row.original.id}
      />
    </>
  );
}
