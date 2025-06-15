"use client";
import * as React from "react";
import { EditOrganizationDialog } from "./EditOrganizationDialog";
import { Organization } from "../../types/Organization";
import { useOrganization } from "../../api/client-side";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";

type EditOrganizationDialogWrapperProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: Organization["id"];
};

export function EditOrganizationDialogWrapper({
  open,
  onOpenChange,
  organizationId,
}: EditOrganizationDialogWrapperProps) {
  const { data, isLoading, isError } = useOrganization(organizationId);

  if (!open) {
    return null;
  }

  const renderContent: Record<string, React.ReactNode> = {
    isLoading: <DialogLoadingContent />,
    isError: <DialogErrorContent />,
    isSuccess: data && (
      <EditOrganizationDialog
        initialValues={data}
        onOpenChange={onOpenChange}
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
