"use client";

import { usePathname } from "next/navigation";
import { FolderKanbanIcon, TicketIcon, UsersIcon } from "lucide-react";
import { PATHS } from "@/shared/lib/paths";
import {
  NavBar,
  NavigationItem,
} from "@/shared/components/custom/navigation/NavBar";
import { Organization } from "@/features/organizations/types/Organization";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";

const EMPLOYEE_NAVIGATION_ITEMS = (
  organizationId: Organization["id"],
  pathname: string
): NavigationItem[] => [
  {
    title: "Projects",
    href: PATHS.EMPLOYEE.projects(organizationId),
    icon: FolderKanbanIcon,
    isActive: pathname.startsWith(PATHS.EMPLOYEE.projects(organizationId)),
  },
  {
    title: "Tickets",
    href: PATHS.EMPLOYEE.tickets(organizationId),
    icon: TicketIcon,
  },
];

export function EmployeeNav() {
  const pathname = usePathname();
  const organizationId = useOrganizationId();

  return <NavBar items={EMPLOYEE_NAVIGATION_ITEMS(organizationId, pathname)} />;
}
