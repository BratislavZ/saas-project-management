"use client";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Form } from "@/shared/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateRolePermissionsAction } from "../actions";
import { useRoleId } from "../hooks/useRoleId";
import { ActionInputUpdateRolePermissions } from "../schemas/action-schemas";
import {
  FormRolePermissions,
  formSchemaRolePermissions,
} from "../schemas/form-schemas";
import { Permission, PermissionGroup } from "../types/Permission";

type Props = {
  permissions: (Permission & { checked: boolean })[];
};

const RolePermissionsContainer = ({ permissions }: Props) => {
  const organizationId = useOrganizationId();
  const roleId = useRoleId();
  const [isPending, startTransition] = React.useTransition();

  // Extract initially selected permission IDs from the checked flag
  const initialPermissionIds = permissions
    .filter((permission) => permission.checked)
    .map((permission) => permission.id);

  const form = useForm<FormRolePermissions>({
    resolver: zodResolver(formSchemaRolePermissions),
    defaultValues: {
      permissionIds: initialPermissionIds,
    },
  });

  function onSave(input: FormRolePermissions) {
    startTransition(async () => {
      const actionData: ActionInputUpdateRolePermissions = {
        organizationId,
        roleId,
        permissionIds: input.permissionIds,
      };

      const { error } = await updateRolePermissionsAction(actionData);

      if (error) {
        toast.error(error.details);
        return;
      }

      form.reset(input);
      toast.success("Role permissions updated");
    });
  }

  // Track selected IDs for checkbox state
  const { watch, setValue } = form;
  const selectedIds = watch("permissionIds");

  // Handler for checkbox changes
  const handleCheckboxChange = (id: number, checked: boolean) => {
    if (checked) {
      setValue("permissionIds", [...selectedIds, id]);
    } else {
      setValue(
        "permissionIds",
        selectedIds.filter((permId) => permId !== id)
      );
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const { group } = permission;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(permission);
    return acc;
  }, {} as Record<PermissionGroup, Permission[]>);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSave, (error) => {
          console.error("Form submission error:", error);
        })}
        className="col-span-3 flex flex-col gap-5"
      >
        <Button disabled={isPending} className="w-fit self-end" type="submit">
          {isPending && <LoaderIcon className="animate-spin text-dark-300" />}
          Save permissions
        </Button>
        {Object.entries(groupedPermissions).map(([group, perms], index) => {
          return (
            <Accordion
              type="single"
              collapsible
              key={index}
              defaultValue={group}
            >
              <AccordionItem value={group}>
                <AccordionTrigger className="bg-white pl-9 capitalize">
                  {group.toLowerCase().split("_").join(" ")}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-3 p-3 font-semibold">
                  {perms.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        id={permission.id.toString()}
                        checked={selectedIds.includes(permission.id)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(permission.id, checked === true)
                        }
                      />
                      <label
                        htmlFor={permission.id.toString()}
                        className="cursor-pointer"
                      >
                        {permission.description}
                      </label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </form>
    </Form>
  );
};

export default RolePermissionsContainer;
