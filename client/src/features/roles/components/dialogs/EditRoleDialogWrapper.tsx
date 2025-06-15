"use client";
import * as React from "react";
import { useRole } from "../../api/client-side";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Role } from "../../types/Role";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import { EditRoleDialog } from "./EditRoleDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId?: Role["id"];
};

export function EditRoleDialogWrapper({ open, onOpenChange, roleId }: Props) {
  const { data, isLoading, isError } = useRole(roleId);

  if (!open) {
    return null;
  }

  const renderContent: Record<string, React.ReactNode> = {
    isLoading: <DialogLoadingContent />,
    isError: <DialogErrorContent />,
    isSuccess: data && (
      <EditRoleDialog initialValues={data} onOpenChange={onOpenChange} />
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
