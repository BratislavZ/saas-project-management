"use client";

import { useProjectId } from "@/features/projects/hooks/useProjectId";
import { useProjectAuthorization } from "@/features/projects/providers/ProjectAuthProvider";
import { useProjectPromise } from "@/features/projects/providers/ProjectProvider";
import { useAllProjectRolesPromise } from "@/features/roles/providers/AllProjectRolesProvider";
import { Can } from "@/shared/components/custom/auth/Can";
import { DataTable } from "@/shared/components/custom/data-table/DataTable";
import { DataTableToolbar } from "@/shared/components/custom/data-table/DataTableToolbar";
import { DataTableRowAction } from "@/shared/components/custom/data-table/lib/types";
import { useDataTable } from "@/shared/hooks/useDataTable";
import React, { use, useMemo } from "react";
import { getPaginatedProjectMembers } from "../../api/get-paginatedProjectMembers";
import { ProjectMember } from "../../types/ProjectMember";
import { AddProjectMemberDialogWrapper } from "../dialogs/AddProjectMemberDialogWrapper";
import { EditProjectMemberDialogWrapper } from "../dialogs/EditProjectMemberDialogWrapper";
import { RemoveProjectMemberDialog } from "../dialogs/RemoveProjectMemberDialog";
import { getProjectMembersTableColumns } from "./columns/ProjectMembersTableColumns";

type Props = {
  projectMembersPromise: Promise<
    Awaited<ReturnType<typeof getPaginatedProjectMembers>>
  >;
};

export function ProjectMembersTable({ projectMembersPromise }: Props) {
  const {
    items: data,
    totalPages: pageCount,
    totalCount,
  } = use(projectMembersPromise);
  const allProjectRoles = use(useAllProjectRolesPromise());
  const project = use(useProjectPromise());

  const projectAuthorization = useProjectAuthorization();

  const disabled = project.status === "ARCHIVED";

  const projectId = useProjectId();

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<ProjectMember> | null>(null);

  const columns = useMemo(
    () =>
      getProjectMembersTableColumns({
        allProjectRoles,
        setRowAction,
        disabled,
        hideDropdown:
          !projectAuthorization.can("PROJECT_MEMBER_ROLE_UPDATE") &&
          !projectAuthorization.can("PROJECT_MEMBER_REMOVE"),
      }),
    [allProjectRoles, disabled, setRowAction]
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

  const [openAddMemberDialog, setOpenAddMemberDialog] = React.useState(false);

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} className="pt-0">
          <Can permission="PROJECT_MEMBER_ADD">
            <AddProjectMemberDialogWrapper
              projectId={projectId}
              useTrigger
              open={openAddMemberDialog}
              onOpenChange={setOpenAddMemberDialog}
              disabled={disabled}
            />
          </Can>
        </DataTableToolbar>
      </DataTable>
      <EditProjectMemberDialogWrapper
        memberId={rowAction?.row.original.id}
        projectId={rowAction?.row.original.project.id}
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
      />
      <RemoveProjectMemberDialog
        memberId={rowAction?.row.original.id}
        projectId={rowAction?.row.original.project.id}
        open={rowAction?.variant === "remove"}
        onOpenChange={() => setRowAction(null)}
      />
    </>
  );
}
