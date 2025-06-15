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
import { Project } from "@/features/projects/types/Project";
import { PROJECT_STATUSES } from "@/features/utils/types/ProjectStatus";
import { formatDate, parseISO } from "date-fns";
import { getProjectStatusIcon } from "@/features/projects/utils";
import Link from "next/link";
import { PATHS } from "@/shared/lib/paths";

type Props = {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Project> | null>
  >;
};

export function getProjectsTableColumns({
  setRowAction,
}: Props): ColumnDef<Project>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const { id: projectId, organization, name } = row.original;

        return (
          <Link
            className="w-fit text-main-400 hover:text-main-500"
            href={PATHS.EMPLOYEE.projectId(organization.id, projectId)}
          >
            <span className="max-w-[31.25rem] truncate">{name}</span>
          </Link>
        );
      },
      meta: {
        label: "Name",
      },
      enableHiding: false,
    },
    {
      id: "description",
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const { description } = row.original;

        return (
          <span
            className={twMerge(
              "max-w-[31.25rem] truncate",
              !description && "text-dark-400"
            )}
          >
            {description ? description : "None"}
          </span>
        );
      },
      meta: {
        label: "Description",
      },
    },

    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const { status } = row.original;

        if (!status) return null;

        const Icon = getProjectStatusIcon(status);

        return (
          <Badge
            variant={status === "ACTIVE" ? "success" : "archived"}
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
        options: PROJECT_STATUSES.map((status) => ({
          label: status.toLowerCase(),
          value: status,
          icon: getProjectStatusIcon(status) as React.FC<
            React.SVGProps<SVGSVGElement>
          >,
        })),
        icon: CircleDashedIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => {
        const { createdAt } = row.original;
        const date = parseISO(createdAt);

        return (
          <span className="max-w-[31.25rem] truncate">
            {formatDate(date, "dd/MM/yyyy")}
          </span>
        );
      },
      meta: {
        label: "Created At",
      },
    },
    {
      id: "actions",

      cell: function Cell({ row }) {
        const status = row.original.status;

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
                  Add member
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onSelect={() => setRowAction({ row, variant: "update" })}
                >
                  <PenSquareIcon />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  className={cn(
                    "flex items-center gap-2",
                    status === "ARCHIVED" && "hidden"
                  )}
                  onSelect={() => setRowAction({ row, variant: "archive" })}
                >
                  {React.createElement(getProjectStatusIcon("ARCHIVED"))}
                  Archive
                </DropdownMenuItem>

                <DropdownMenuItem
                  className={cn(
                    "flex items-center gap-2",
                    status === "ACTIVE" && "hidden"
                  )}
                  onSelect={() => setRowAction({ row, variant: "activate" })}
                >
                  {React.createElement(getProjectStatusIcon("ACTIVE"))}
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
