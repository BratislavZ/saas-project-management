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

import { EmployeeForm } from "../forms/EmployeeForm";
import { Employee } from "../../types/Employee";
import { FormEmployee, formSchemaEmployee } from "../../schemas/form-schemas";
import { editEmployeeAction } from "../../actions";

type Props = {
  initialValues: Employee;
  onOpenChange: React.ComponentPropsWithRef<typeof Dialog>["onOpenChange"];
};

export function EditEmployeeDialog({ initialValues, ...props }: Props) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormEmployee>({
    resolver: zodResolver(formSchemaEmployee),
    defaultValues: {
      name: initialValues.name,
      email: initialValues.email,
    },
  });

  function onSubmit(input: FormEmployee) {
    startTransition(async () => {
      const { error } = await editEmployeeAction({
        ...input,
        employeeId: initialValues.id,
        organizationId: initialValues.organizationId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset(input);
      props.onOpenChange?.(false);
      toast.success("Employee updated");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="text-left">
        <DialogTitle>Edit employee</DialogTitle>
        <DialogDescription>
          Edit the employee details and save the changes
        </DialogDescription>
      </DialogHeader>
      <EmployeeForm form={form} onSubmit={onSubmit} isEdit>
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
      </EmployeeForm>
    </div>
  );
}
