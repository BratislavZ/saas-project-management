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

import { OrganizationAdminForm } from "../forms/OrganizationAdminForm";
import {
  FormOrganizationAdmin,
  formSchemaOrganizationAdmin,
} from "../../schemas/form-schemas";
import { createOrganizationAdminAction } from "../../actions";
import { Organization } from "@/features/organizations/types/Organization";

type Props = {
  organizations: Pick<Organization, "id" | "name">[];
};

export function AddOrganizationAdminDialog({ organizations }: Props) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormOrganizationAdmin>({
    resolver: zodResolver(formSchemaOrganizationAdmin),
    defaultValues: {
      name: "",
      email: "",
      organizationId: undefined,
    },
  });

  function onSubmit(input: FormOrganizationAdmin) {
    startTransition(async () => {
      const { error } = await createOrganizationAdminAction(input);

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset(input);
      setOpen(false);
      toast.success("Organization admin added");
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
          Add organization admin
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>Add organization admin</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new organization admin.
          </DialogDescription>
        </DialogHeader>
        <OrganizationAdminForm
          form={form}
          onSubmit={onSubmit}
          organizations={organizations}
        >
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
        </OrganizationAdminForm>
      </DialogContent>
    </Dialog>
  );
}
