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
import { activateProjectAction } from "../../actions";
import { useProject } from "../../api/client-side";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import { Project } from "../../types/Project";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";

type Props = React.ComponentPropsWithoutRef<typeof Dialog> & {
  projectId?: Project["id"];
};

export function ActivateProjectDialog({ projectId, ...props }: Props) {
  const { data, isLoading, isError } = useProject(projectId);
  const organizationId = useOrganizationId();

  const [isPending, startActivateTransition] = React.useTransition();

  function onActivate() {
    if (!projectId) {
      return;
    }

    startActivateTransition(async () => {
      const { error } = await activateProjectAction({
        projectId: projectId,
        organizationId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      props.onOpenChange?.(false);
      toast.success("Project activated");
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
            This will activate the project{" "}
            <span className="font-semibold text-dark-900">{data.name}</span> and
            make it available in your organization.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            aria-label="Activate project"
            onClick={onActivate}
            disabled={isPending}
          >
            {isPending && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Activate
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
