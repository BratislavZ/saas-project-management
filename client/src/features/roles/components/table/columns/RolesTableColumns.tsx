"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisIcon, PenSquareIcon, Trash2Icon } from "lucide-react";
import * as React from "react";

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
import { Role } from "@/features/roles/types/Role";
import Link from "next/link";
import { PATHS } from "@/shared/lib/paths";

type Props = {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Role> | null>
  >;
};

export function getRolesTableColumns({
  setRowAction,
}: Props): ColumnDef<Role>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const { id, organizationId } = row.original;
        return (
          <Link
            href={PATHS.ORGANIZATION_ADMIN.roleIdPermissions(
              organizationId,
              id
            )}
            className="text-main-400 hover:text-main-500 max-w-[31.25rem] truncate"
          >
            {row.original.name}
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
      id: "actions",

      cell: function Cell({ row }) {
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
                  className={cn("flex items-center gap-2")}
                  onSelect={() => setRowAction({ row, variant: "delete" })}
                >
                  <Trash2Icon />
                  Delete
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
