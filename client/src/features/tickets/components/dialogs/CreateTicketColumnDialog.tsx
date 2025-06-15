"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PlusIcon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
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

import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { useProjectId } from "@/features/projects/hooks/useProjectId";
import { useProjectPromise } from "@/features/projects/providers/ProjectProvider";
import { createTicketColumnAction } from "../../actions";
import {
  formSchemaTicketColumn,
  FormTicketColumn,
} from "../../schemas/form-schemas";
import { TicketColumnForm } from "../forms/TicketColumnForm";

export function CreateTicketColumnDialog() {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const organizationId = useOrganizationId();
  const projectId = useProjectId();

  const project = React.use(useProjectPromise());
  const disabled = project.status === "ARCHIVED";

  const form = useForm<FormTicketColumn>({
    resolver: zodResolver(formSchemaTicketColumn),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(input: FormTicketColumn) {
    startTransition(async () => {
      const { error } = await createTicketColumnAction({
        ...input,
        organizationId,
        projectId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset();
      setOpen(false);
      toast.success("Column created");
    });
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant={"outline"} disabled={disabled}>
          <PlusIcon />
          Create column
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>Create column</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new column.
          </DialogDescription>
        </DialogHeader>
        <TicketColumnForm form={form} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending}>
              {isPending && (
                <LoaderIcon className="animate-spin text-dark-300" />
              )}
              Create
            </Button>
          </DialogFooter>
        </TicketColumnForm>
      </DialogContent>
    </Dialog>
  );
}
