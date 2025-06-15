"use client";

import { DataTable } from "@/shared/components/custom/data-table/DataTable";
import { DataTableRowAction } from "@/shared/components/custom/data-table/lib/types";
import { getProjectsTableColumns } from "./columns/ProjectsTableColumns";
import { useDataTable } from "@/shared/hooks/useDataTable";
import { DataTableToolbar } from "@/shared/components/custom/data-table/DataTableToolbar";
import { use, useMemo, useState } from "react";
import { CreateProjectDialog } from "../dialogs/CreateProjectDialog";
import { EditProjectDialogWrapper } from "../dialogs/EditProjectDialogWrapper";

import { getPaginatedProjects } from "../../api/get-paginatedProjects";
import { Project } from "../../types/Project";
import { ArchiveProjectDialog } from "../dialogs/ArchiveProjectDialog";
import { ActivateProjectDialog } from "../dialogs/ActivateProjectDialog";
import { AddProjectMemberDialogWrapper } from "@/features/project-members/components/dialogs/AddProjectMemberDialogWrapper";
import { getAllRoles } from "@/features/roles/api/get-allRoles";
import { getAllEmployees } from "@/features/employees/api/get-allEmployees";

interface Props {
  promise: Promise<Awaited<ReturnType<typeof getPaginatedProjects>>>;
}

export function ProjectsTable({ promise }: Props) {
  const { items: data, totalPages: pageCount, totalCount } = use(promise);

  const [rowAction, setRowAction] =
    useState<DataTableRowAction<Project> | null>(null);

  const columns = useMemo(
    () =>
      getProjectsTableColumns({
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
          <CreateProjectDialog />
        </DataTableToolbar>
      </DataTable>
      <EditProjectDialogWrapper
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
        projectId={rowAction?.row.original.id}
      />
      <ArchiveProjectDialog
        open={rowAction?.variant === "archive"}
        onOpenChange={() => setRowAction(null)}
        projectId={rowAction?.row.original.id}
      />
      <ActivateProjectDialog
        open={rowAction?.variant === "activate"}
        onOpenChange={() => setRowAction(null)}
        projectId={rowAction?.row.original.id}
      />
      <AddProjectMemberDialogWrapper
        open={rowAction?.variant === "add"}
        onOpenChange={() => setRowAction(null)}
        projectId={rowAction?.row.original.id}
      />
    </>
  );
}
