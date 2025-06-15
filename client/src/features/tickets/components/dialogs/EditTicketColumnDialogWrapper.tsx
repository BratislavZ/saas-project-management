"use client";
import * as React from "react";

import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import { EditTicketColumnDialog } from "./EditTicketColumnDialog";
import { useTicketColumn } from "../../api/client-side";
import { TicketColumn } from "../../types/TicketColumn";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (ticketColumnId: TicketColumn["id"]) => void;
  columnId?: TicketColumn["id"];
};

export function EditTicketColumnDialogWrapper({
  open,
  onOpenChange,
  onDelete,
  columnId,
}: Props) {
  const { data, isLoading, isError, error } = useTicketColumn(columnId);

  if (!open) {
    return null;
  }

  const renderContent: Record<string, React.ReactNode> = {
    isLoading: <DialogLoadingContent />,
    isError: <DialogErrorContent />,
    isSuccess: data && (
      <EditTicketColumnDialog
        initialValues={data}
        onOpenChange={onOpenChange}
        onDelete={onDelete}
      />
    ),
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => onOpenChange(newOpen)}>
      <DialogContent className="sm:max-w-md">
        {
          renderContent[
            isLoading ? "isLoading" : isError ? "isError" : "isSuccess"
          ]
        }
      </DialogContent>
    </Dialog>
  );
}
