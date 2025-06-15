"use client";

import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { PATHS } from "@/shared/lib/paths";
import { Organization } from "@/features/organizations/types/Organization";
import { usePathname } from "next/navigation";
import { Project } from "../types/Project";
import { useProjectId } from "../hooks/useProjectId";
import NavigationLink from "@/shared/components/custom/navigation/NavigationLink";

const PROJECT_SETTINGS_NAVIGATION_ITEMS = (
  organizationId: Organization["id"],
  roleId: Project["id"]
) => [
  {
    title: "Members",
    href: PATHS.EMPLOYEE.projectIdSettings.members(organizationId, roleId),
  },
];

const ProjectIdSettingsNavigationPanel = () => {
  const organizationId = useOrganizationId();
  const projectId = useProjectId();

  const pathname = usePathname();

  return (
    <nav className="p-3 flex flex-col gap-1 bg-white">
      {PROJECT_SETTINGS_NAVIGATION_ITEMS(organizationId, projectId).map(
        (item) => {
          return (
            <NavigationLink
              key={item.href}
              href={item.href}
              title={item.title}
              isActive={pathname.startsWith(item.href)}
            />
          );
        }
      )}
    </nav>
  );
};

export default ProjectIdSettingsNavigationPanel;
