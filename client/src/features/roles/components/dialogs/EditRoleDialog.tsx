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

import { Role } from "../../types/Role";
import { FormRole, formSchemaRole } from "../../schemas/form-schemas";
import { RoleForm } from "../forms/RoleForm";
import { editRoleAction } from "../../actions";

type Props = {
  initialValues: Role;
  onOpenChange: React.ComponentPropsWithRef<typeof Dialog>["onOpenChange"];
};

export function EditRoleDialog({ initialValues, ...props }: Props) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormRole>({
    resolver: zodResolver(formSchemaRole),
    defaultValues: {
      name: initialValues.name,
      description: initialValues.description,
    },
  });

  function onSubmit(input: FormRole) {
    startTransition(async () => {
      const { error } = await editRoleAction({
        ...input,
        roleId: initialValues.id,
        organizationId: initialValues.organizationId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset(input);
      props.onOpenChange?.(false);
      toast.success("Role updated");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="text-left">
        <DialogTitle>Edit role</DialogTitle>
        <DialogDescription>
          Edit the role details and save the changes
        </DialogDescription>
      </DialogHeader>
      <RoleForm form={form} onSubmit={onSubmit}>
        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={isPending}>
            {isPending && <LoaderIcon className="animate-spin text-dark-300" />}
            Save
          </Button>
        </DialogFooter>
      </RoleForm>
    </div>
  );
}
