"use client";

import { Loader } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { archiveProjectAction } from "../../actions";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import { useProject } from "../../api/client-side";
import { Project } from "../../types/Project";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";

type Props = React.ComponentPropsWithoutRef<typeof Dialog> & {
  projectId?: Project["id"];
};

export function ArchiveProjectDialog({ projectId, ...props }: Props) {
  const { data, isLoading, isError } = useProject(projectId);
  const organizationId = useOrganizationId();

  const [isPending, startArchiveTransition] = React.useTransition();

  function onArchive() {
    if (!projectId) {
      return;
    }

    startArchiveTransition(async () => {
      const { error } = await archiveProjectAction({
        projectId,
        organizationId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      props.onOpenChange?.(false);
      toast.success("Project archived");
    });
  }

  const renderContent: Record<
    "isLoading" | "isError" | "isSuccess",
    React.ReactNode
  > = {
    isLoading: <DialogLoadingContent />,
    isError: <DialogErrorContent />,
    isSuccess: data && (
      <>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This will archive{" "}
            <span className="font-semibold text-dark-900">{data.name}</span>.
            Archived projects can be restored later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            aria-label="Archive project"
            variant="destructive"
            onClick={onArchive}
            disabled={isPending}
          >
            {isPending && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Archive
          </Button>
        </DialogFooter>
      </>
    ),
  };

  if (!props.open || !projectId) {
    return null;
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
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
