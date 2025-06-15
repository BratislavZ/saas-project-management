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
import { DataTableColumnHeader } from "@/shared/components/custom/data-table/DataTableColumnHeader";
import { twMerge } from "tailwind-merge";
import { cn } from "@/shared/utils/tailwind";
import { OrganizationAdmin } from "@/features/organization-admins/types/OrganizationAdmin";
import { getOrganizationAdminStatusIcon } from "@/features/organization-admins/utils";
import { USER_STATUSES } from "@/features/utils/types/UserStatus";
import { Organization } from "@/features/organizations/types/Organization";

type Props = {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<OrganizationAdmin> | null>
  >;
  organizations: Array<Organization>;
};

export function getOrganizationAdminsTableColumns({
  setRowAction,
  organizations,
}: Props): ColumnDef<OrganizationAdmin>[] {
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
      id: "organization",
      accessorKey: "organization",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Organization" />
      ),
      cell: ({ row }) => {
        return (
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.original.organization.name}
          </span>
        );
      },
      meta: {
        label: "Organization",
        variant: "select",
        options: organizations.map((organization) => ({
          label: organization.name,
          value: organization.id.toString(),
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
        const { status } = row.original.user;

        if (!status) return null;

        const Icon = getOrganizationAdminStatusIcon(status);

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
          icon: getOrganizationAdminStatusIcon(status) as React.FC<
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
        const status = row.original.user.status;

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
