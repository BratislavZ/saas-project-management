"use client";
import { Project } from "@/features/projects/types/Project";
import SheetErrorContent from "@/shared/components/custom/sheets/SheetErrorContent";
import SheetLoadingContent from "@/shared/components/custom/sheets/SheetLoadingContent";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import * as React from "react";
import { useTicket } from "../../api/client-side";
import { Ticket } from "../../types/Ticket";
import { EditTicketSheet } from "./EditTicketSheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId?: Ticket["id"];
  projectId?: Project["id"];
  onDelete: (ticketId: Ticket["id"]) => void;
};

export function EditTicketSheetWrapper({
  open,
  onOpenChange,
  ticketId,
  projectId,
  onDelete,
}: Props) {
  const { data, isLoading, isError } = useTicket({
    projectId,
    ticketId,
  });

  if (!open) {
    return null;
  }

  const renderContent: Record<string, React.ReactNode> = {
    isLoading: <SheetLoadingContent />,
    isError: <SheetErrorContent />,
    isSuccess: data && (
      <EditTicketSheet
        initialValues={data}
        onOpenChange={onOpenChange}
        onDelete={onDelete}
      />
    ),
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
