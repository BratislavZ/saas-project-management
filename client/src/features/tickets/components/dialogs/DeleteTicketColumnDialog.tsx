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
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { useTicketColumn } from "../../api/client-side";
import { useProjectId } from "@/features/projects/hooks/useProjectId";
import { TicketColumn } from "../../types/TicketColumn";
import { deleteTicketColumnAction } from "../../actions";

type Props = React.ComponentPropsWithoutRef<typeof Dialog> & {
  columnId?: TicketColumn["id"];
  onSuccess?: () => void;
};

export function DeleteTicketColumnDialog({ columnId, ...props }: Props) {
  const { data, isLoading, isError } = useTicketColumn(columnId);
  const organizationId = useOrganizationId();
  const projectId = useProjectId();

  const [isPending, startDeleteTransition] = React.useTransition();

  function onDelete() {
    if (!columnId) {
      return;
    }

    startDeleteTransition(async () => {
      const { error } = await deleteTicketColumnAction({
        ticketColumnId: columnId,
        organizationId,
        projectId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      props.onOpenChange?.(false);
      props.onSuccess?.();
      toast.success("Column deleted");
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
          <DialogTitle>Delete column</DialogTitle>
          <DialogDescription>
            This will delete{" "}
            <span className="font-semibold text-dark-900">{data.name}</span>.
            This action cannot be undone. Are you sure you want to proceed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            aria-label="Ban selected admins"
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
          >
            {isPending && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </>
    ),
  };

  if (!props.open || !columnId) {
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
