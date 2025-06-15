"use client";
import * as React from "react";
import { EditOrganizationAdminDialog } from "./EditOrganizationAdminDialog";
import { useOrganizationAdmin } from "../../api/client-side";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { OrganizationAdmin } from "../../types/OrganizationAdmin";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import { Organization } from "@/features/organizations/types/Organization";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationAdminId?: OrganizationAdmin["id"];
  organizations: Pick<Organization, "id" | "name">[];
};

export function EditOrganizationAdminDialogWrapper({
  open,
  onOpenChange,
  organizationAdminId,
  organizations,
}: Props) {
  const { data, isLoading, isError } =
    useOrganizationAdmin(organizationAdminId);

  if (!open) {
    return null;
  }

  const renderContent: Record<string, React.ReactNode> = {
    isLoading: <DialogLoadingContent />,
    isError: <DialogErrorContent />,
    isSuccess: data && (
      <EditOrganizationAdminDialog
        initialValues={data}
        onOpenChange={onOpenChange}
        organizations={organizations}
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
