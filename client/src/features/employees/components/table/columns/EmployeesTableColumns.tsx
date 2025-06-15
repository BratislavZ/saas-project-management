"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  BanIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  EllipsisIcon,
  PenSquareIcon,
  PlusIcon,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { DataTableRowAction } from "@/shared/components/custom/data-table/lib/types";
import { DataTableColumnHeader } from "@/shared/components/custom/data-table/DataTableColumnHeader";
import { twMerge } from "tailwind-merge";
import { cn } from "@/shared/utils/tailwind";
import { USER_STATUSES } from "@/features/utils/types/UserStatus";
import { Project } from "@/features/projects/types/Project";
import { Employee } from "@/features/employees/types/Employee";
import { getEmployeeStatusIcon } from "@/features/employees/utils";

type Props = {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Employee> | null>
  >;
  projects: Array<Pick<Project, "id" | "name" | "status">>;
};

export function getEmployeesTableColumns({
  setRowAction,
  projects,
}: Props): ColumnDef<Employee>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        return (
          <span className="max-w-[31.25rem] truncate">{row.original.name}</span>
        );
      },
      meta: {
        label: "Name",
      },
    },
    {
      id: "email",
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => {
        const { email } = row.original;

        return (
          <span className={twMerge("max-w-[31.25rem] truncate")}>{email}</span>
        );
      },
      enableHiding: false,
      meta: {
        label: "Email",
      },
    },
    {
      id: "projectId",
      accessorKey: "projects",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Projects" />
      ),
      cell: ({ row }) => {
        const { projects } = row.original;
        const projectCount = projects.length;

        return (
          <span
            className={cn(
              "max-w-[31.25rem] truncate",
              projectCount === 0 && "text-dark-400"
            )}
          >
            {projectCount > 0
              ? projects.map((project) => project.name).join(", ")
              : "No projects"}
          </span>
        );
      },
      meta: {
        label: "Project",
        variant: "select",
        options: projects.map((project) => ({
          label: project.name,
          value: project.id.toString(),
        })),
        icon: CircleDashedIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const {
          user: { status },
        } = row.original;

        if (!status) return null;

        const Icon = getEmployeeStatusIcon(status);

        return (
          <Badge
            variant={status === "ACTIVE" ? "success" : "destructive"}
            className={cn("py-1 [&>svg]:size-3.5")}
          >
            <Icon />
            <span className="lowercase">{status}</span>
          </Badge>
        );
      },
      meta: {
        label: "Status",
        variant: "select",
        options: USER_STATUSES.map((status) => ({
          label: status.toLowerCase(),
          value: status,
          icon: getEmployeeStatusIcon(status) as React.FC<
            React.SVGProps<SVGSVGElement>
          >,
        })),
        icon: CircleDashedIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "actions",

      cell: function Cell({ row }) {
        const { status } = row.original.user;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  className="flex size-8 p-0 data-[state=open]:bg-muted"
                >
                  <EllipsisIcon className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onSelect={() => setRowAction({ row, variant: "add" })}
                >
                  <PlusIcon />
                  Add to project
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onSelect={() => setRowAction({ row, variant: "update" })}
                >
                  <PenSquareIcon />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  className={cn(
                    "flex items-center gap-2",
                    status === "BANNED" && "hidden"
                  )}
                  onSelect={() => setRowAction({ row, variant: "ban" })}
                >
                  <BanIcon className="text-red-500" />
                  Ban
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "flex items-center gap-2",
                    status === "ACTIVE" && "hidden"
                  )}
                  onSelect={() => setRowAction({ row, variant: "activate" })}
                >
                  <CheckCircle2Icon />
                  Activate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 40,
    },
  ];
}
