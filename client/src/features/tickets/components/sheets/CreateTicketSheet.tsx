"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PlusIcon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { useProjectId } from "@/features/projects/hooks/useProjectId";
import { useProjectPromise } from "@/features/projects/providers/ProjectProvider";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { createTicketAction } from "../../actions";
import { formSchemaTicket, FormTicket } from "../../schemas/form-schemas";
import { TicketForm } from "../forms/TicketForm";

export function CreateTicketSheet() {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const organizationId = useOrganizationId();
  const projectId = useProjectId();

  const project = React.use(useProjectPromise());
  const disabled = project.status === "ARCHIVED";

  const form = useForm<FormTicket>({
    resolver: zodResolver(formSchemaTicket),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function onSubmit(input: FormTicket) {
    startTransition(async () => {
      const { error } = await createTicketAction({
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
      toast.success("Ticket created");
    });
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm" disabled={disabled}>
          <PlusIcon />
          Create ticket
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Create ticket</SheetTitle>
          <SheetDescription>
            Fill in the details below to create a new ticket.
          </SheetDescription>
        </SheetHeader>
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              Loading...
            </div>
          }
        >
          <TicketForm form={form} onSubmit={onSubmit}>
            <SheetFooter className="gap-2 pt-2 sm:space-x-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button disabled={isPending}>
                {isPending && (
                  <LoaderIcon className="animate-spin text-dark-300" />
                )}
                Create
              </Button>
            </SheetFooter>
          </TicketForm>
        </React.Suspense>
      </SheetContent>
    </Sheet>
  );
}
