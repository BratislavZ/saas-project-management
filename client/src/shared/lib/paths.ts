// src/lib/paths.ts

export const PATHS = {
  // SuperAdmin
  SUPER_ADMIN: {
    organizations: "/super-admin/organizations",
    admins: "/super-admin/admins",
    // SETTINGS: "/super-admin/settings",
  },

  // OrganizationAdmin
  ORGANIZATION_ADMIN: {
    employees: (organizationId: number) =>
      `/organization/${organizationId}/admin/employees`,
    projects: (organizationId: number) =>
      `/organization/${organizationId}/admin/projects`,
    roles: (organizationId: number) =>
      `/organization/${organizationId}/admin/roles`,
    roleIdPermissions: (organizationId: number, roleId: number) =>
      `/organization/${organizationId}/admin/roles/${roleId}/permissions`,
    roleIdEmployees: (organizationId: number, roleId: number) =>
      `/organization/${organizationId}/admin/roles/${roleId}/employees`,
  },

  // Employee
  EMPLOYEE: {
    projects: (organizationId: number) =>
      `/organization/${organizationId}/projects`,
    projectId: (organizationId: number, projectId: number) =>
      `/organization/${organizationId}/projects/${projectId}`,
    projectIdSettings: {
      members: (organizationId: number, projectId: number) =>
        `/organization/${organizationId}/projects/${projectId}/settings/members`,
    },
    tickets: (organizationId: number) =>
      `/organization/${organizationId}/tickets`,
  },

  // Public
  PUBLIC: {
    home: "/",
    pricing: "/pricing",
    docs: "/docs",
  },

  // Other
  OTHER: {
    accessDenied: "/access-denied",
    logout: "/logout",
  },
} as const;

export type Paths = typeof PATHS;
