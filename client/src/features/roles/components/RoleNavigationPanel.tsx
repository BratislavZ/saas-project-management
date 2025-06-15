"use client";

import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { PATHS } from "@/shared/lib/paths";
import { useRoleId } from "../hooks/useRoleId";
import { Organization } from "@/features/organizations/types/Organization";
import { Role } from "../types/Role";
import { usePathname } from "next/navigation";
import NavigationLink from "@/shared/components/custom/navigation/NavigationLink";

const ROLE_NAVIGATION_ITEMS = (
  organizationId: Organization["id"],
  roleId: Role["id"]
) => [
  {
    title: "Permissions",
    href: PATHS.ORGANIZATION_ADMIN.roleIdPermissions(organizationId, roleId),
  },
  {
    title: "Employees",
    href: PATHS.ORGANIZATION_ADMIN.roleIdEmployees(organizationId, roleId),
  },
];

const RoleNavigationPanel = () => {
  const organizationId = useOrganizationId();
  const roleId = useRoleId();

  const pathname = usePathname();

  return (
    <nav className="p-3 flex flex-col gap-1 bg-white">
      {ROLE_NAVIGATION_ITEMS(organizationId, roleId).map((item) => {
        return (
          <NavigationLink
            key={item.href}
            href={item.href}
            title={item.title}
            isActive={pathname.startsWith(item.href)}
          />
        );
      })}
    </nav>
  );
};

export default RoleNavigationPanel;
