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

import { OrganizationAdminForm } from "../forms/OrganizationAdminForm";
import { OrganizationAdmin } from "../../types/OrganizationAdmin";
import {
  FormOrganizationAdmin,
  formSchemaOrganizationAdmin,
} from "../../schemas/form-schemas";
import { editOrganizationAdminAction } from "../../actions";
import { Organization } from "@/features/organizations/types/Organization";

type Props = {
  initialValues: OrganizationAdmin;
  organizations: Pick<Organization, "id" | "name">[];
  onOpenChange: React.ComponentPropsWithRef<typeof Dialog>["onOpenChange"];
};

export function EditOrganizationAdminDialog({
  initialValues,
  organizations,
  ...props
}: Props) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormOrganizationAdmin>({
    resolver: zodResolver(formSchemaOrganizationAdmin),
    defaultValues: {
      name: initialValues.name,
      email: initialValues.email,
      organizationId: initialValues.organization.id,
    },
  });

  function onSubmit(input: FormOrganizationAdmin) {
    startTransition(async () => {
      const { error } = await editOrganizationAdminAction({
        ...input,
        organizationAdminId: initialValues.id,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset(input);
      props.onOpenChange?.(false);
      toast.success("Admin updated");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="text-left">
        <DialogTitle>Edit organization admin</DialogTitle>
        <DialogDescription>
          Edit the organization admin details and save the changes
        </DialogDescription>
      </DialogHeader>
      <OrganizationAdminForm
        form={form}
        onSubmit={onSubmit}
        isEdit
        organizations={organizations}
      >
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
      </OrganizationAdminForm>
    </div>
  );
}
