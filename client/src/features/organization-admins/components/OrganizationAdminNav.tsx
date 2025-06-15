"use client";

import { usePathname } from "next/navigation";
import { FolderKanbanIcon, ShieldIcon, UsersIcon } from "lucide-react";
import { PATHS } from "@/shared/lib/paths";
import {
  NavBar,
  NavigationItem,
} from "@/shared/components/custom/navigation/NavBar";
import { Organization } from "@/features/organizations/types/Organization";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";

const ORGANIZATION_ADMIN_NAVIGATION_ITEMS = (
  organizationId: Organization["id"],
  pathname: string
): NavigationItem[] => [
  {
    title: "Projects",
    href: PATHS.ORGANIZATION_ADMIN.projects(organizationId),
    icon: FolderKanbanIcon,
    isActive:
      pathname.startsWith(PATHS.ORGANIZATION_ADMIN.projects(organizationId)) ||
      pathname.startsWith(PATHS.EMPLOYEE.projects(organizationId)), // when organization admin is viewing project id
  },
  {
    title: "Employees",
    href: PATHS.ORGANIZATION_ADMIN.employees(organizationId),
    icon: UsersIcon,
  },
  {
    title: "Roles",
    href: PATHS.ORGANIZATION_ADMIN.roles(organizationId),
    icon: ShieldIcon,
  },
];

export function OrganizationAdminNav() {
  const pathname = usePathname();
  const organizationId = useOrganizationId();

  return (
    <NavBar
      items={ORGANIZATION_ADMIN_NAVIGATION_ITEMS(organizationId, pathname)}
    />
  );
}
