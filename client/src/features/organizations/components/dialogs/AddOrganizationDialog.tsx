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
import { createOrganizationAction } from "../../actions";
import {
  FormOrganization,
  formSchemaOrganization,
} from "../../schemas/form-schemas";
import { OrganizationForm } from "../forms/OrganizationForm";

export function AddOrganizationDialog() {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormOrganization>({
    resolver: zodResolver(formSchemaOrganization),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(input: FormOrganization) {
    startTransition(async () => {
      const { error } = await createOrganizationAction(input);

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset();
      setOpen(false);
      toast.success("Organization added");
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
          Add organization
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>Add organization</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new organization.
          </DialogDescription>
        </DialogHeader>
        <OrganizationForm form={form} onSubmit={onSubmit}>
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
        </OrganizationForm>
      </DialogContent>
    </Dialog>
  );
}
