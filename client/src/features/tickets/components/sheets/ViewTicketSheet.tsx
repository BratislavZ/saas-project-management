"use client";

import * as React from "react";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { format } from "date-fns";
import { Badge } from "@/shared/components/ui/badge";
import { Ticket } from "../../types/Ticket";
import { getTicketPriorityBadge } from "../../utils";
import { cn } from "@/shared/utils/tailwind";
import Link from "next/link";
import { PATHS } from "@/shared/lib/paths";

type Props = {
  ticket: Ticket;
};

export function ViewTicketSheet({ ticket }: Props) {
  // Helper to display assignee information
  const getAssigneeInfo = () => {
    if (!ticket.assignee) return "Unassigned";
    return `${ticket.assignee.name} (${ticket.assignee.email})`;
  };

  // Helper to format dates consistently
  const formatDate = (dateString: string | null) => {
    if (!dateString) return <span className="text-foreground">/</span>;
    return format(new Date(dateString), "MMM dd, yyyy)");
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <SheetHeader className="text-left">
        <SheetTitle>View ticket</SheetTitle>
        <SheetDescription>Details for ticket: {ticket.title}</SheetDescription>
      </SheetHeader>

      <div className="overflow-y-auto flex-1 pr-2 -mx-4 px-4">
        <div className="space-y-6">
          {/* Ticket Title */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
            <p className="text-lg font-semibold">{ticket.title}</p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Description
            </h3>
            <p
              className={cn(
                "text-base whitespace-pre-wrap border rounded-md p-4 bg-muted/20 min-h-32 max-h-40 overflow-y-auto",
                ticket.description ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {ticket.description || "No description provided"}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="flex flex-col gap-4">
            {/* Priority */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Priority
              </h3>
              {getTicketPriorityBadge(ticket.priority)}
            </div>

            {/* Type */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Type
              </h3>
              <Badge variant="outline" className="capitalize">
                {ticket.type.toLowerCase()}
              </Badge>
            </div>

            {/* Project */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Project
              </h3>
              <Link
                className="w-fit text-main-400 hover:text-main-500"
                href={PATHS.EMPLOYEE.projectId(
                  ticket.project.organizationId,
                  ticket.project.id
                )}
              >
                <span className="max-w-[31.25rem] truncate">
                  {ticket.project.name}
                </span>
              </Link>
            </div>

            {/* Column */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Status
              </h3>
              <p>{ticket.ticketColumn.name}</p>
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Assignee
              </h3>
              <p>{getAssigneeInfo()}</p>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Due Date
              </h3>
              <p>{formatDate(ticket.dueDate)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
