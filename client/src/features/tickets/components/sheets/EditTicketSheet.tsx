"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { parseISO } from "date-fns";
import { editTicketAction } from "../../actions";
import { formSchemaTicket, FormTicket } from "../../schemas/form-schemas";
import { Ticket } from "../../types/Ticket";
import { TicketForm } from "../forms/TicketForm";

type Props = {
  initialValues: Ticket;
  onOpenChange: React.ComponentPropsWithRef<typeof Sheet>["onOpenChange"];
  onDelete: (ticketId: Ticket["id"]) => void;
};

export function EditTicketSheet({
  initialValues,
  onOpenChange,
  onDelete,
}: Props) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormTicket>({
    resolver: zodResolver(formSchemaTicket),
    defaultValues: {
      title: initialValues.title,
      description: initialValues.description,
      type: initialValues.type,
      priority: initialValues.priority,
      assigneeId: initialValues.assigneeId ?? undefined,
      columnId: initialValues.ticketColumn.id,
      dueDate: initialValues.dueDate
        ? parseISO(initialValues.dueDate)
        : undefined,
    },
  });

  function onSubmit(input: FormTicket) {
    startTransition(async () => {
      const { error } = await editTicketAction({
        ...input,
        ticketId: initialValues.id,
        organizationId: initialValues.project.organizationId,
        projectId: initialValues.project.id,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset();
      onOpenChange?.(false);
      toast.success("Ticket updated");
    });
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <SheetHeader className="text-left">
        <SheetTitle>Edit ticket</SheetTitle>
        <SheetDescription>
          Fill in the details below to edit a ticket.
        </SheetDescription>
      </SheetHeader>
      <TicketForm form={form} onSubmit={onSubmit}>
        <SheetFooter className="sm:space-x-0">
          <div className="flex gap-2 items-center">
            <SheetClose asChild>
              <Button size={"lg"} type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button
              size={"lg"}
              type="button"
              onClick={() => onDelete(initialValues.id)}
              variant="destructiveOutlined"
            >
              Delete
            </Button>
          </div>
          <Button size={"lg"} disabled={isPending}>
            {isPending && <LoaderIcon className="animate-spin text-dark-300" />}
            Save
          </Button>
        </SheetFooter>
      </TicketForm>
    </div>
  );
}
