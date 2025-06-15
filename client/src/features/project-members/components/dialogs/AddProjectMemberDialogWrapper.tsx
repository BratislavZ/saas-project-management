"use client";

import { useProject } from "@/features/projects/api/client-side";
import { Project } from "@/features/projects/types/Project";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import * as React from "react";
import { AddProjectMemberDialog } from "./AddProjectMemberDialog";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  projectId?: Project["id"];
  useTrigger?: boolean;
  disabled?: boolean;
};

export function AddProjectMemberDialogWrapper({
  open,
  onOpenChange,
  projectId,
  useTrigger,
  disabled,
}: Props) {
  const { data: project, isLoading, isError } = useProject(projectId);

  const renderContent: Record<string, React.ReactNode> = {
    isLoading: <DialogLoadingContent />,
    isError: <DialogErrorContent />,
    isSuccess: project && (
      <AddProjectMemberDialog project={project} onOpenChange={onOpenChange} />
    ),
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => onOpenChange?.(newOpen)}>
      {useTrigger && (
        <DialogTrigger asChild disabled={disabled}>
          <Button size="sm">
            <PlusIcon />
            Add member
          </Button>
        </DialogTrigger>
      )}
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
