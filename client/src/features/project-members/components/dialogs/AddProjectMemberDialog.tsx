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

import { useAllEmployeesPromise } from "@/features/employees/providers/AllEmployeesProvider ";
import { createProjectMemberAction } from "@/features/project-members/actions";
import { Project } from "@/features/projects/types/Project";
import { useAllRolesPromise } from "@/features/roles/providers/AllRolesProvider";
import {
  FormProjectMember,
  formSchemaProjectMember,
} from "../../schemas/form-schemas";
import { ProjectMemberForm } from "../forms/ProjectMemberForm";

type Props = {
  project: Project;
  onOpenChange: React.ComponentPropsWithRef<typeof Dialog>["onOpenChange"];
};

export function AddProjectMemberDialog({ project, ...props }: Props) {
  const [isPending, startTransition] = React.useTransition();

  const employees = React.use(useAllEmployeesPromise());
  const roles = React.use(useAllRolesPromise());

  const form = useForm<FormProjectMember>({
    resolver: zodResolver(formSchemaProjectMember),
  });

  function onSubmit(input: FormProjectMember) {
    startTransition(async () => {
      const { error } = await createProjectMemberAction({
        ...input,
        projectId: project.id,
        organizationId: project.organization.id,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset(input);
      props.onOpenChange?.(false);
      toast.success(`Added member to project ${project.name}`);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="text-left">
        <DialogTitle>Add member</DialogTitle>
        <DialogDescription>
          Add member to <span className="font-semibold">{project.name}</span>
        </DialogDescription>
      </DialogHeader>
      <ProjectMemberForm
        form={form}
        onSubmit={onSubmit}
        employees={employees}
        roles={roles}
      >
        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={isPending}>
            {isPending && <LoaderIcon className="animate-spin text-dark-300" />}
            Add
          </Button>
        </DialogFooter>
      </ProjectMemberForm>
    </div>
  );
}
