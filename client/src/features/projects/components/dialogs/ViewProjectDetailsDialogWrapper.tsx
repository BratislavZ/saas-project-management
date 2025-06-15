"use client";
import * as React from "react";
import { useProject } from "../../api/client-side";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Project } from "../../types/Project";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import { ViewProjectDetailsDialog } from "./ViewProjectDetailsDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: Project["id"];
};

export function ViewProjectDetailsDialogWrapper({
  open,
  onOpenChange,
  projectId,
}: Props) {
  const { data, isLoading, isError } = useProject(projectId);

  if (!open) {
    return null;
  }

  const renderContent: Record<string, React.ReactNode> = {
    isLoading: <DialogLoadingContent />,
    isError: <DialogErrorContent />,
    isSuccess: data && <ViewProjectDetailsDialog project={data} />,
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
