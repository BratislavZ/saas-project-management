"use client";
import * as React from "react";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { Ticket } from "../../types/Ticket";
import { EditTicketSheet } from "./EditTicketSheet";
import SheetLoadingContent from "@/shared/components/custom/sheets/SheetLoadingContent";
import SheetErrorContent from "@/shared/components/custom/sheets/SheetErrorContent";
import { useTicket } from "../../api/client-side";
import { getTicketColumns } from "../../api/get-ticketColumns";
import { getAllProjectMembers } from "@/features/project-members/api/get-allProjectMembers";
import { ViewTicketSheet } from "./ViewTicketSheet";
import { Project } from "@/features/projects/types/Project";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId?: Ticket["id"];
  projectId?: Project["id"];
};

export function ViewTicketSheetWrapper({
  open,
  onOpenChange,
  ticketId,
  projectId,
}: Props) {
  const { data, isLoading, isError } = useTicket({ ticketId, projectId });

  if (!open) {
    return null;
  }

  const renderContent: Record<string, React.ReactNode> = {
    isLoading: <SheetLoadingContent />,
    isError: <SheetErrorContent />,
    isSuccess: data && <ViewTicketSheet ticket={data} />,
  };

  return (
    <Sheet open={open} onOpenChange={(newOpen) => onOpenChange(newOpen)}>
      <SheetContent className="sm:max-w-md">
        {
          renderContent[
            isLoading ? "isLoading" : isError ? "isError" : "isSuccess"
          ]
        }
      </SheetContent>
    </Sheet>
  );
}
