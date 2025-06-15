"use client";

import { DataTable } from "@/shared/components/custom/data-table/DataTable";
import { DataTableRowAction } from "@/shared/components/custom/data-table/lib/types";
import { getEmployeesTableColumns } from "./columns/EmployeesTableColumns";
import { useDataTable } from "@/shared/hooks/useDataTable";
import { DataTableToolbar } from "@/shared/components/custom/data-table/DataTableToolbar";
import { use, useMemo, useState } from "react";
import { AddEmployeeDialog } from "../dialogs/AddEmployeeDialog";

import { getPaginatedEmployees } from "../../api/get-paginatedEmployees";
import { Employee } from "../../types/Employee";
import { ActivateEmployeeDialog } from "../dialogs/ActivateEmployeeDialog";
import { getAllProjects } from "@/features/projects/api/get-allProjects";
import { AddEmployeeToProjectDialog } from "../dialogs/AddEmployeeToProjectDialog";
import { getAllRoles } from "@/features/roles/api/get-allRoles";
import { EditEmployeeDialogWrapper } from "../dialogs/EditEmployeeDialogWrapper";
import { BanEmployeeDialog } from "../dialogs/BanEmployeeDialog";

interface Props {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getPaginatedEmployees>>,
      Awaited<ReturnType<typeof getAllProjects>>,
      Awaited<ReturnType<typeof getAllRoles>>
    ]
  >;
}

export function EmployeesTable({ promises }: Props) {
  const [
    { items: data, totalPages: pageCount, totalCount },
    allProjects,
    allRoles,
  ] = use(promises);

  const activeProjects = useMemo(() => {
    return allProjects.filter((project) => project.status === "ACTIVE");
  }, [allProjects]);

  const [rowAction, setRowAction] =
    useState<DataTableRowAction<Employee> | null>(null);

  const columns = useMemo(
    () =>
      getEmployeesTableColumns({
        setRowAction,
        projects: allProjects,
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
          <AddEmployeeDialog />
        </DataTableToolbar>
      </DataTable>
      <EditEmployeeDialogWrapper
        employeeId={rowAction?.row.original.id}
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
      />
      <BanEmployeeDialog
        employeeId={rowAction?.row.original.id}
        open={rowAction?.variant === "ban"}
        onOpenChange={() => setRowAction(null)}
      />
      <ActivateEmployeeDialog
        open={rowAction?.variant === "activate"}
        onOpenChange={() => setRowAction(null)}
        employeeId={rowAction?.row.original.id}
      />
      <AddEmployeeToProjectDialog
        open={rowAction?.variant === "add"}
        onOpenChange={() => setRowAction(null)}
        employeeId={rowAction?.row.original.id}
        projects={activeProjects}
        roles={allRoles}
      />
    </>
  );
}
