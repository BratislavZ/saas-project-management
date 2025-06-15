"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

import { DataTableColumnHeader } from "@/shared/components/custom/data-table/DataTableColumnHeader";
import { twMerge } from "tailwind-merge";
import { RoleMember } from "@/features/roles/types/RoleMember";

export function getRoleMembersTableColumns(): ColumnDef<RoleMember>[] {
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
      enableSorting: false,
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
      enableSorting: false,
      meta: {
        label: "Email",
      },
    },
  ];
}
