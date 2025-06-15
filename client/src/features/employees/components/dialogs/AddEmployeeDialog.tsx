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

import { EmployeeForm } from "../forms/EmployeeForm";
import { FormEmployee, formSchemaEmployee } from "../../schemas/form-schemas";
import { createEmployeeAction } from "../../actions";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";

export function AddEmployeeDialog() {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const organizationId = useOrganizationId();

  const form = useForm<FormEmployee>({
    resolver: zodResolver(formSchemaEmployee),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  function onSubmit(input: FormEmployee) {
    startTransition(async () => {
      const { error } = await createEmployeeAction({
        ...input,
        organizationId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset();

      setOpen(false);
      toast.success("Employee added");
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
          Add employee
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>Add employee</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new employee.
          </DialogDescription>
        </DialogHeader>
        <EmployeeForm form={form} onSubmit={onSubmit}>
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
              Add
            </Button>
          </DialogFooter>
        </EmployeeForm>
      </DialogContent>
    </Dialog>
  );
}
