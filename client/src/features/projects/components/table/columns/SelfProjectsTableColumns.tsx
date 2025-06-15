"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
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
import { DataTableColumnHeader } from "@/shared/components/custom/data-table/DataTableColumnHeader";
import { twMerge } from "tailwind-merge";
import { cn } from "@/shared/utils/tailwind";
import { PROJECT_STATUSES } from "@/features/utils/types/ProjectStatus";
import { formatDate, parseISO } from "date-fns";
import { getProjectStatusIcon } from "@/features/projects/utils";
import Link from "next/link";
import { PATHS } from "@/shared/lib/paths";
import { SelfProject } from "@/features/projects/types/SelfProject";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { Role } from "@/features/roles/types/Role";

type Props = {
  roles: Array<Pick<Role, "id" | "name">>;
};

export function getSelfProjectsTableColumns({
  roles,
}: Props): ColumnDef<SelfProject>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const { id: projectId, name, organizationId } = row.original;

        return (
          <Link
            className="w-fit text-main-400 hover:text-main-500"
            href={PATHS.EMPLOYEE.projectId(organizationId, projectId)}
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
      id: "Description",
      accessorKey: "Description",
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
    },
    {
      id: "role",
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const { role } = row.original;

        return <p>{role.name}</p>;
      },
      meta: {
        label: "Role",
        variant: "select",
        options: roles.map((role) => ({
          label: role.name,
          value: role.id.toString(),
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
  ];
}
