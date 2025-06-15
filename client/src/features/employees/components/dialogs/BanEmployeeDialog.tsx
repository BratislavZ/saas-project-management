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
import { banEmployeeAction } from "../../actions";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import { useEmployee } from "../../api/client-side";
import { Employee } from "../../types/Employee";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";

type Props = React.ComponentPropsWithoutRef<typeof Dialog> & {
  employeeId?: Employee["id"];
};

export function BanEmployeeDialog({ employeeId, ...props }: Props) {
  const { data, isLoading, isError } = useEmployee(employeeId);
  const organizationId = useOrganizationId();

  const [isPending, startBanTransition] = React.useTransition();

  function onBan() {
    if (!employeeId) {
      return;
    }

    startBanTransition(async () => {
      const { error } = await banEmployeeAction({
        employeeId,
        organizationId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      props.onOpenChange?.(false);
      toast.success("Employee banned");
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
            This will ban{" "}
            <span className="font-semibold text-dark-900">{data.name}</span> and
            not allow access to any part of the organization.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            aria-label="Ban selected admins"
            variant="destructive"
            onClick={onBan}
            disabled={isPending}
          >
            {isPending && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Ban
          </Button>
        </DialogFooter>
      </>
    ),
  };

  if (!props.open || !employeeId) {
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
