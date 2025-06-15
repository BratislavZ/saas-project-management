"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

import { ProjectMember } from "@/features/project-members/types/ProjectMember";
import { getAllProjectRoles } from "@/features/roles/api/get-allProjectRoles";
import { Can } from "@/shared/components/custom/auth/Can";
import { DataTableColumnHeader } from "@/shared/components/custom/data-table/DataTableColumnHeader";
import { DataTableRowAction } from "@/shared/components/custom/data-table/lib/types";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/utils/tailwind";
import { BanIcon, EllipsisIcon, PenSquareIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

type Props = {
  allProjectRoles: Awaited<ReturnType<typeof getAllProjectRoles>>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<ProjectMember> | null>
  >;
  hideDropdown?: boolean;
  disabled?: boolean;
};

export function getProjectMembersTableColumns({
  allProjectRoles,
  setRowAction,
  disabled,
  hideDropdown,
}: Props): ColumnDef<ProjectMember>[] {
  return [
    {
      id: "employee",
      accessorKey: "employee",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Member" />
      ),
      cell: ({ row }) => {
        const { name, email } = row.original.employee;
        return (
          <div className="max-w-[31.25rem] truncate flex flex-col">
            <span className="text-sm">{name}</span>
            <span className="text-xs">{email}</span>
          </div>
        );
      },
      meta: {
        label: "Employee",
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "role",
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const { role } = row.original;

        return (
          <span className={twMerge("max-w-[31.25rem] truncate")}>
            {role.name}
          </span>
        );
      },
      meta: {
        label: "Role",
        variant: "select",
        options: allProjectRoles.map((role) => ({
          label: role.name,
          value: role.id.toString(),
        })),
      },
      enableColumnFilter: true,
      enableHiding: true,
      enableSorting: true,
    },
    {
      id: "actions",

      cell: function Cell({ row }) {
        return (
          <div className={cn("flex justify-end", hideDropdown && "hidden")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={disabled}>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  className="flex size-8 p-0 data-[state=open]:bg-muted"
                >
                  <EllipsisIcon className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <Can permission="PROJECT_MEMBER_ROLE_UPDATE">
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onSelect={() => setRowAction({ row, variant: "update" })}
                  >
                    <PenSquareIcon />
                    Edit
                  </DropdownMenuItem>
                </Can>
                <Can permission="PROJECT_MEMBER_REMOVE">
                  <DropdownMenuItem
                    variant="destructive"
                    className="flex items-center gap-2"
                    onSelect={() => setRowAction({ row, variant: "remove" })}
                  >
                    <BanIcon className="text-red-500" />
                    Remove
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 40,
    },
  ];
}
