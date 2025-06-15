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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { editOrganizationAction } from "../../actions";
import {
  FormOrganization,
  formSchemaOrganization,
} from "../../schemas/form-schemas";
import { OrganizationForm } from "../forms/OrganizationForm";
import { Organization } from "../../types/Organization";

type Props = {
  initialValues: Organization;
  onOpenChange: React.ComponentPropsWithRef<typeof Dialog>["onOpenChange"];
};

export function EditOrganizationDialog({ initialValues, ...props }: Props) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormOrganization>({
    resolver: zodResolver(formSchemaOrganization),
    defaultValues: {
      name: initialValues.name,
      description: initialValues.description ?? "",
    },
  });

  function onSubmit(input: FormOrganization) {
    startTransition(async () => {
      const { error } = await editOrganizationAction({
        ...input,
        organizationId: initialValues.id,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset(input);
      props.onOpenChange?.(false);
      toast.success("Organization updated");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="text-left">
        <DialogTitle>Edit organization</DialogTitle>
        <DialogDescription>
          Edit the organization details and save the changes
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
            {isPending && <LoaderIcon className="animate-spin text-dark-300" />}
            Save
          </Button>
        </DialogFooter>
      </OrganizationForm>
    </div>
  );
}
