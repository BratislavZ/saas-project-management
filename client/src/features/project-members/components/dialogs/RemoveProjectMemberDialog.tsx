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
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import { useProjectMember } from "../../api/client-side";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { ProjectMember } from "../../types/ProjectMember";
import { Project } from "@/features/projects/types/Project";
import { removeProjectMemberAction } from "../../actions";

type Props = React.ComponentPropsWithoutRef<typeof Dialog> & {
  memberId?: ProjectMember["id"];
  projectId?: Project["id"];
};

export function RemoveProjectMemberDialog({
  memberId,
  projectId,
  ...props
}: Props) {
  const {
    data: projectMember,
    isLoading,
    isError,
  } = useProjectMember({ projectId, memberId });
  const organizationId = useOrganizationId();

  const [isPending, startBanTransition] = React.useTransition();

  function onRemove() {
    if (!projectMember?.id || !projectId) {
      toast.error("Unexpected error: Member ID is missing.");
      return;
    }

    startBanTransition(async () => {
      const { error } = await removeProjectMemberAction({
        memberId: projectMember.id,
        projectId,
        organizationId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      props.onOpenChange?.(false);
      toast.success("Member removed from project");
    });
  }

  const renderContent: Record<
    "isLoading" | "isError" | "isSuccess",
    React.ReactNode
  > = {
    isLoading: <DialogLoadingContent />,
    isError: <DialogErrorContent />,
    isSuccess: projectMember && (
      <>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-2">
              <p>
                This will remove{" "}
                <span className="font-semibold text-dark-900">
                  {projectMember.employee.name}
                </span>{" "}
                and not allow access to any part of the project.
              </p>
              <p>
                Also, all their tickets would become{" "}
                <span className="font-semibold text-dark-900">unassigned</span>.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            aria-label="Ban selected admins"
            variant="destructive"
            onClick={onRemove}
            disabled={isPending}
          >
            {isPending && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Remove
          </Button>
        </DialogFooter>
      </>
    ),
  };

  if (!props.open || !memberId || !projectId) {
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
