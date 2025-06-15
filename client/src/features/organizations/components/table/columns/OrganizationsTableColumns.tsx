"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  BanIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  EllipsisIcon,
  PenSquareIcon,
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
import { Organization } from "@/features/organizations/types/Organization";
import { DataTableColumnHeader } from "@/shared/components/custom/data-table/DataTableColumnHeader";
import { getOrganizationStatusIcon } from "@/features/organizations/utils";
import { twMerge } from "tailwind-merge";
import { ORGANIZATION_STATUSES } from "@/features/organizations/types/OrganizationStatus";
import { cn } from "@/shared/utils/tailwind";

interface GetTasksTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Organization> | null>
  >;
}

export function getOrganizationsTableColumns({
  setRowAction,
}: GetTasksTableColumnsProps): ColumnDef<Organization>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        return (
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.original.name}
          </span>
        );
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
      enableSorting: false,
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

        const Icon = getOrganizationStatusIcon(status);

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
        options: ORGANIZATION_STATUSES.map((status) => ({
          label: status.toLowerCase(),
          value: status,
          icon: getOrganizationStatusIcon(status) as React.FC<
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
