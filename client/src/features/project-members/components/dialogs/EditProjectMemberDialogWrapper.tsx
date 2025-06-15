"use client";
import * as React from "react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import { ProjectMember } from "../../types/ProjectMember";
import { useProjectMember } from "../../api/client-side";
import { Project } from "@/features/projects/types/Project";
import { EditProjectMemberDialog } from "./EditProjectMemberDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId?: ProjectMember["id"];
  projectId?: Project["id"];
};

export function EditProjectMemberDialogWrapper({
  open,
  onOpenChange,
  memberId,
  projectId,
}: Props) {
  const {
    data: projectMember,
    isLoading,
    isError,
  } = useProjectMember({
    projectId,
    memberId,
  });

  if (!open) {
    return null;
  }

  const renderContent: Record<string, React.ReactNode> = {
    isLoading: <DialogLoadingContent />,
    isError: <DialogErrorContent />,
    isSuccess: projectMember && (
      <EditProjectMemberDialog
        initialValues={projectMember}
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
