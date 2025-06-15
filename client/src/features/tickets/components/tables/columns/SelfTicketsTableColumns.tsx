"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CircleDashedIcon } from "lucide-react";
import * as React from "react";

import { DataTableColumnHeader } from "@/shared/components/custom/data-table/DataTableColumnHeader";
import { formatDate, parseISO } from "date-fns";
import { SelfProject } from "@/features/projects/types/SelfProject";
import { SelfTicket } from "@/features/tickets/types/SelfTicket";
import { getTicketPriorityBadge } from "@/features/tickets/utils";
import { TICKET_PRIORITIES } from "@/features/tickets/types/TicketPriority";
import { TICKET_TYPES } from "@/features/tickets/types/TicketType";

type Props = {
  projects: Array<Pick<SelfProject, "id" | "name">>;
};

export function getSelfTicketsTableColumns({
  projects,
}: Props): ColumnDef<SelfTicket>[] {
  return [
    {
      id: "title",
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const { title } = row.original;

        return <span className="max-w-[31.25rem] truncate">{title}</span>;
      },
      meta: {
        label: "Title",
      },
      enableHiding: false,
    },
    {
      id: "project",
      accessorKey: "project",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({ row }) => {
        const { project } = row.original;

        return <span>{project.name}</span>;
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
      id: "priority",
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const { priority } = row.original;

        return <>{getTicketPriorityBadge(priority)}</>;
      },
      meta: {
        label: "Priority",
        variant: "select",
        options: TICKET_PRIORITIES.map((priority) => ({
          label: priority.toLowerCase(),
          value: priority,
        })),
        icon: CircleDashedIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "type",
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const { type } = row.original;

        return <span>{type.toLowerCase()}</span>;
      },
      meta: {
        label: "Type",
        variant: "select",
        options: TICKET_TYPES.map((type) => ({
          label: type.toLowerCase(),
          value: type,
        })),
        icon: CircleDashedIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "dueDate",
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => {
        const { dueDate } = row.original;

        if (!dueDate) {
          return <span className="text-muted-foreground">/</span>;
        }

        const date = parseISO(dueDate);

        return (
          <span className="max-w-[31.25rem] truncate">
            {formatDate(date, "dd/MM/yyyy")}
          </span>
        );
      },
      meta: {
        label: "Due date",
      },
    },
  ];
}
