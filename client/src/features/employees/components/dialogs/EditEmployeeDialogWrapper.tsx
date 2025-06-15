"use client";
import * as React from "react";
import { EditEmployeeDialog } from "./EditEmployeeDialog";
import { useEmployee } from "../../api/client-side";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Employee } from "../../types/Employee";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: Employee["id"];
};

export function EditEmployeeDialogWrapper({
  open,
  onOpenChange,
  employeeId,
}: Props) {
  const { data, isLoading, isError } = useEmployee(employeeId);

  if (!open) {
    return null;
  }

  const renderContent: Record<string, React.ReactNode> = {
    isLoading: <DialogLoadingContent />,
    isError: <DialogErrorContent />,
    isSuccess: data && (
      <EditEmployeeDialog initialValues={data} onOpenChange={onOpenChange} />
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
