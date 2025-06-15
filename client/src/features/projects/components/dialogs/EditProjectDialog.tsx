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

import { Project } from "../../types/Project";
import { FormProject, formSchemaProject } from "../../schemas/form-schemas";
import { editProjectAction } from "../../actions";
import { ProjectForm } from "../forms/ProjectForm";

type Props = {
  initialValues: Project;
  onOpenChange: React.ComponentPropsWithRef<typeof Dialog>["onOpenChange"];
};

export function EditProjectDialog({ initialValues, ...props }: Props) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormProject>({
    resolver: zodResolver(formSchemaProject),
    defaultValues: {
      name: initialValues.name,
      description: initialValues.description ?? "",
    },
  });

  function onSubmit(input: FormProject) {
    startTransition(async () => {
      const { error } = await editProjectAction({
        ...input,
        projectId: initialValues.id,
        organizationId: initialValues.organization.id,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset(input);
      props.onOpenChange?.(false);
      toast.success("Project updated");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="text-left">
        <DialogTitle>Edit project</DialogTitle>
        <DialogDescription>
          Edit the project details and save the changes
        </DialogDescription>
      </DialogHeader>
      <ProjectForm form={form} onSubmit={onSubmit}>
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
      </ProjectForm>
    </div>
  );
}
