"use client";

import { LoaderIcon } from "lucide-react";
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
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { ServerError } from "@/shared/lib/error";

type Props = React.ComponentPropsWithoutRef<typeof Dialog> & {
  action: () => Promise<{ error?: ServerError }>;
  successMessage: string;
  children: React.ReactNode;
  buttonProps?: React.ComponentPropsWithoutRef<typeof Button>;
  showTrigger?: boolean;
};

export function ActionDialog({
  showTrigger = true,
  action,
  children,
  successMessage,
  buttonProps,
  ...props
}: Props) {
  const [isPending, startBanTransition] = React.useTransition();

  function onAction() {
    startBanTransition(async () => {
      const { error } = await action();

      if (error) {
        toast.error(error.details);
        return;
      }

      props.onOpenChange?.(false);
      toast.success(successMessage);
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>{children}</DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:space-x-0">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button {...buttonProps} onClick={onAction} disabled={isPending}>
          {isPending && (
            <LoaderIcon
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Ban
        </Button>
      </DialogFooter>
    </>
  );
}
