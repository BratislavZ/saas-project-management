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

import { RoleForm } from "../forms/RoleForm";
import { FormRole, formSchemaRole } from "../../schemas/form-schemas";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { createRoleAction } from "../../actions";

export function CreateRoleDialog() {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const organizationId = useOrganizationId();

  const form = useForm<FormRole>({
    resolver: zodResolver(formSchemaRole),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(input: FormRole) {
    startTransition(async () => {
      const { error } = await createRoleAction({ ...input, organizationId });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset();
      setOpen(false);
      toast.success("Role created");
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
        <Button size="sm">
          <PlusIcon />
          Create role
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>Add role</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new role.
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
              {isPending && (
                <LoaderIcon className="animate-spin text-dark-300" />
              )}
              Create
            </Button>
          </DialogFooter>
        </RoleForm>
      </DialogContent>
    </Dialog>
  );
}
