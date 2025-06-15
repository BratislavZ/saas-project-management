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
import { activateOrganizationAdminAction } from "../../actions";
import { useOrganizationAdmin } from "../../api/client-side";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import { OrganizationAdmin } from "../../types/OrganizationAdmin";

type Props = React.ComponentPropsWithoutRef<typeof Dialog> & {
  organizationAdminId?: OrganizationAdmin["id"];
};

export function ActivateOrganizationAdminDialog({
  organizationAdminId,
  ...props
}: Props) {
  const { data, isLoading, isError } =
    useOrganizationAdmin(organizationAdminId);

  const [isPending, startBanTransition] = React.useTransition();

  function onActivate() {
    if (!organizationAdminId) {
      return;
    }

    startBanTransition(async () => {
      const { error } = await activateOrganizationAdminAction({
        organizationAdminId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      props.onOpenChange?.(false);
      toast.success("Admin activated");
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
            This will activate{" "}
            <span className="font-semibold text-dark-900">{data.name}</span> and
            allow admin to access any part of the organization.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            aria-label="Activate selected admin"
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

  if (!props.open || !organizationAdminId) {
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
