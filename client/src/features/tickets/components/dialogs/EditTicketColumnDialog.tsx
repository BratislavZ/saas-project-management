"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { BasicTicketColumn } from "../../types/TicketColumn";
import {
  formSchemaTicketColumn,
  FormTicketColumn,
} from "../../schemas/form-schemas";
import { TicketColumnForm } from "../forms/TicketColumnForm";
import { editTicketColumnAction } from "../../actions";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";

type Props = {
  initialValues: BasicTicketColumn;
  onOpenChange: React.ComponentPropsWithRef<typeof Dialog>["onOpenChange"];
  onDelete?: (columnId: BasicTicketColumn["id"]) => void;
};

export function EditTicketColumnDialog({ initialValues, ...props }: Props) {
  const organizationId = useOrganizationId();

  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormTicketColumn>({
    resolver: zodResolver(formSchemaTicketColumn),
    defaultValues: {
      name: initialValues.name,
      description: initialValues.description,
    },
  });

  function onSubmit(input: FormTicketColumn) {
    startTransition(async () => {
      const { error } = await editTicketColumnAction({
        ...input,
        ticketColumnId: initialValues.id,
        organizationId,
        projectId: initialValues.projectId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset(input);
      props.onOpenChange?.(false);
      toast.success("Column updated");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="text-left">
        <DialogTitle>Edit column</DialogTitle>
        <DialogDescription>
          Edit the column details and save the changes
        </DialogDescription>
      </DialogHeader>
      <TicketColumnForm form={form} onSubmit={onSubmit}>
        <DialogFooter className="gap-2 pt-2 flex justify-between sm:justify-between sm:space-x-0">
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructiveOutlined"
              onClick={() => props.onDelete?.(initialValues.id)}
            >
              Delete
            </Button>
          </div>
          <Button disabled={isPending}>
            {isPending && <LoaderIcon className="animate-spin text-dark-300" />}
            Save
          </Button>
        </DialogFooter>
      </TicketColumnForm>
    </div>
  );
}
