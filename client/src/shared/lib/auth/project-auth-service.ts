import { Project } from "@/features/projects/types/Project";
import { Permission } from "@/features/roles/types/Permission";
import { Me } from "@/features/utils/types/Me";

export class ProjectAuthorizationService {
  private user: Me;
  private project: Project;
  private permissions: Set<Permission["code"]>;

  constructor(
    user: Me,
    project: Project,
    // For OrgAdmins, this will be an empty set. For Employees, it's their permissions.
    employeePermissions: Set<Permission["code"]>
  ) {
    this.user = user;
    this.project = project;
    this.permissions = employeePermissions;
  }

  public can(permission: Permission["code"]): boolean {
    // SuperAdmins can NOT access project
    if (this.user.isSuperAdmin) {
      return false;
    }

    if (this.user.isOrganizationAdmin) {
      return this.project.organization.id === this.user.organization?.id;
    }

    return this.permissions.has(permission);
  }
}
