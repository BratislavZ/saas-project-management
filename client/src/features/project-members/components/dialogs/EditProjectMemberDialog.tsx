"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { useAllRolesPromise } from "@/features/roles/providers/AllRolesProvider";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { editProjectMemberAction } from "../../actions";
import { useProjectMembersPromise } from "../../providers/ProjectMembersProvider";
import {
  FormProjectMember,
  formSchemaProjectMember,
} from "../../schemas/form-schemas";
import { ProjectMember } from "../../types/ProjectMember";
import { ProjectMemberForm } from "../forms/ProjectMemberForm";

type Props = {
  initialValues: ProjectMember;
  onOpenChange: React.ComponentPropsWithRef<typeof Dialog>["onOpenChange"];
};

export function EditProjectMemberDialog({ initialValues, ...props }: Props) {
  const [isPending, startTransition] = React.useTransition();
  const organizationId = useOrganizationId();

  const employees = React.use(useProjectMembersPromise());
  const roles = React.use(useAllRolesPromise());

  const form = useForm<FormProjectMember>({
    resolver: zodResolver(formSchemaProjectMember),
    defaultValues: {
      employeeId: initialValues.employee.id,
      roleId: initialValues.role.id,
    },
  });

  function onSubmit(input: FormProjectMember) {
    startTransition(async () => {
      const { error } = await editProjectMemberAction({
        ...input,
        memberId: initialValues.id,
        projectId: initialValues.project.id,
        organizationId,
      });

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset(input);
      props.onOpenChange?.(false);
      toast.success("Member updated");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="text-left">
        <DialogTitle>Edit member</DialogTitle>
        <DialogDescription>
          Edit the member details and save the changes
        </DialogDescription>
      </DialogHeader>
      <ProjectMemberForm
        form={form}
        onSubmit={onSubmit}
        roles={roles}
        employees={employees}
        isEdit
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
      </ProjectMemberForm>
    </div>
  );
}
