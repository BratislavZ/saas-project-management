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
import { useRole } from "../../api/client-side";
import { Role } from "../../types/Role";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { deleteRoleAction } from "../../actions";

type Props = React.ComponentPropsWithoutRef<typeof Dialog> & {
  roleId?: Role["id"];
};

export function DeleteRoleDialog({ roleId, ...props }: Props) {
  const { data, isLoading, isError } = useRole(roleId);
  const organizationId = useOrganizationId();

  const [isPending, startTransition] = React.useTransition();

  function onDelete() {
    if (!roleId) {
      return;
    }

    startTransition(async () => {
      const { error } = await deleteRoleAction({
        roleId,
        organizationId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      props.onOpenChange?.(false);
      toast.success("Role deleted");
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
            This will delete{" "}
            <span className="font-semibold text-dark-900">{data.name}</span>.
            Deleted roles cannot be recovered. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            aria-label="Archive project"
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

  if (!props.open || !roleId) {
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
