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
import { activateEmployeeAction } from "../../actions";
import { useEmployee } from "../../api/client-side";
import DialogLoadingContent from "@/shared/components/custom/dialogs/DialogLoadingContent";
import DialogErrorContent from "@/shared/components/custom/dialogs/DialogErrorContent";
import { Employee } from "../../types/Employee";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";

type Props = React.ComponentPropsWithoutRef<typeof Dialog> & {
  employeeId?: Employee["id"];
};

export function ActivateEmployeeDialog({ employeeId, ...props }: Props) {
  const { data, isLoading, isError } = useEmployee(employeeId);
  const organizationId = useOrganizationId();

  const [isPending, startBanTransition] = React.useTransition();

  function onActivate() {
    if (!employeeId) {
      return;
    }

    startBanTransition(async () => {
      const { error } = await activateEmployeeAction({
        employeeId,
        organizationId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      props.onOpenChange?.(false);
      toast.success("Employee activated");
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
            allow employee to access your organization.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            aria-label="Activate employee"
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
