import { verifyOrganizationAdminAccess } from "@/features/organization-admins/verify-access";
import { getPermissions } from "@/features/roles/api/get-permissions";
import { RoleDetails } from "@/features/roles/components/RoleDetails";
import RoleNavigationPanel from "@/features/roles/components/RoleNavigationPanel";
import RolePermissionsContainer from "@/features/roles/components/RolePermissionsContainer";
import { verifyRoleIdValid } from "@/features/roles/verify-access";
import { auth } from "@clerk/nextjs/server";
import { Params } from "next/dist/server/request/params";
import { z } from "zod";

const paramsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
  roleId: z.coerce.number().int().positive(),
});

type Props = {
  params: Promise<Params>;
};

export default async function RoleIdPermissionsPage(props: Props) {
  await auth.protect();

  const { organizationId, roleId } = await paramsSchema.parseAsync(
    await props.params
  );

  // authorization check
  await verifyOrganizationAdminAccess(organizationId);
  // ensure roleId is valid
  const { role } = await verifyRoleIdValid({
    organizationId,
    roleId,
  });

  const permissions = await getPermissions();

  const activeRolePermissions = role.permissions ?? [];

  const preparedPermissions = permissions.map((permission) => ({
    ...permission,
    checked: activeRolePermissions.some((p) => p.id === permission.id),
  }));

  return (
    <main className="grid grid-cols-4 gap-4">
      <div className="col-span-1 border h-fit overflow-hidden border-dark-200 shadow-card rounded-xl">
        <RoleDetails role={role} />
        <RoleNavigationPanel />
      </div>
      <RolePermissionsContainer permissions={preparedPermissions} />
    </main>
  );
}
