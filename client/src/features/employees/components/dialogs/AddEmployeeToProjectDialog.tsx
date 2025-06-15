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

import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import {
  formSchemaEmployeeToProject,
  FormEmployeeToProject,
} from "../../schemas/form-schemas";
import { createProjectMemberAction } from "@/features/project-members/actions";
import { Project } from "@/features/projects/types/Project";
import { EmployeeToProjectForm } from "../forms/EmployeeToProjectForm";
import { Role } from "@/features/roles/types/Role";
import { Employee } from "../../types/Employee";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: Employee["id"];
  projects: Array<Pick<Project, "id" | "name" | "status">>;
  roles: Array<Pick<Role, "id" | "name">>;
};

export function AddEmployeeToProjectDialog({
  employeeId,
  projects,
  roles,
  ...props
}: Props) {
  const [isPending, startTransition] = React.useTransition();
  const organizationId = useOrganizationId();

  const form = useForm<FormEmployeeToProject>({
    resolver: zodResolver(formSchemaEmployeeToProject),
  });

  function onSubmit(input: FormEmployeeToProject) {
    if (!employeeId) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    startTransition(async () => {
      const { error } = await createProjectMemberAction({
        ...input,
        employeeId,
        organizationId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset();
      props.onOpenChange(false);
      toast.success("Employee added to the project");
    });
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    props.onOpenChange(newOpen);
  };

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>Add employee to project</DialogTitle>
          <DialogDescription>
            Fill in the details below to add the employee to a project.
          </DialogDescription>
        </DialogHeader>
        <EmployeeToProjectForm
          form={form}
          onSubmit={onSubmit}
          projects={projects}
          roles={roles}
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
              Add
            </Button>
          </DialogFooter>
        </EmployeeToProjectForm>
      </DialogContent>
    </Dialog>
  );
}
