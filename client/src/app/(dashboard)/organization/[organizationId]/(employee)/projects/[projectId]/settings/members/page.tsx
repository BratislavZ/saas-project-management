import { getAllEmployees } from "@/features/employees/api/get-allEmployees";
import AllEmployeesProvider from "@/features/employees/providers/AllEmployeesProvider ";
import { Organization } from "@/features/organizations/types/Organization";
import { getAllProjectMembers } from "@/features/project-members/api/get-allProjectMembers";
import { getPaginatedProjectMembers } from "@/features/project-members/api/get-paginatedProjectMembers";
import { getSelfProjectMembership } from "@/features/project-members/api/get-selfProjectMembership";
import { ProjectMembersTable } from "@/features/project-members/components/table/ProjectMembersTable";
import ProjectMembersProvider from "@/features/project-members/providers/ProjectMembersProvider";
import { projectMembersSearchParamsCache } from "@/features/project-members/schemas/get-schemas";
import ProjectIdDetails, {
  ProjectIdDetailsSkeleton,
} from "@/features/projects/components/ProjectDetails";
import ProjectIdSettingsNavigationPanel from "@/features/projects/components/ProjectIdSettingsNavigationPanel";
import { ProjectAuthProvider } from "@/features/projects/providers/ProjectAuthProvider";
import ProjectProvider from "@/features/projects/providers/ProjectProvider";
import { Project } from "@/features/projects/types/Project";
import { verifyProjectIdValid } from "@/features/projects/verify-access";
import { getAllProjectRoles } from "@/features/roles/api/get-allProjectRoles";
import { getAllRoles } from "@/features/roles/api/get-allRoles";
import AllProjectRolesProvider from "@/features/roles/providers/AllProjectRolesProvider";
import AllRolesProvider from "@/features/roles/providers/AllRolesProvider";
import { getMe } from "@/features/utils/api/get-me";
import { DataTableSkeleton } from "@/shared/components/custom/data-table/DataTableSkeleton";
import { NOT_FOUND_SERVER_ERROR } from "@/shared/lib/error";
import { auth } from "@clerk/nextjs/server";
import { Params } from "next/dist/server/request/params";
import { SearchParams } from "next/dist/server/request/search-params";
import { notFound } from "next/navigation";
import React from "react";
import { z } from "zod";

type PageProps = {
  searchParams: Promise<SearchParams>;
  params: Promise<Params>;
};

const projectMembersParamsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
  projectId: z.coerce.number().int().positive(),
});

export default async function ProjectIdMembersPage(props: PageProps) {
  await auth.protect();

  const [searchParams, params] = await Promise.all([
    props.searchParams,
    props.params,
  ]);

  const { organizationId, projectId } =
    projectMembersParamsSchema.parse(params);

  // authorization check
  const { currentUser, projectMember } = await verifyPageAccess({
    organizationId,
    projectId,
  });
  // ensure projectId is valid
  const { project } = await verifyProjectIdValid({
    organizationId,
    projectId,
  });

  const search = projectMembersSearchParamsCache.parse(searchParams);

  return (
    <main className="grid grid-cols-4 gap-4">
      <ProjectProvider projectPromise={Promise.resolve(project)}>
        <div className="col-span-1 border h-fit overflow-hidden border-border shadow-card rounded-xl">
          <div className="px-6 py-3">
            <React.Suspense fallback={<ProjectIdDetailsSkeleton />}>
              <ProjectIdDetails titleClassName="text-2xl" />
            </React.Suspense>
          </div>
          <ProjectIdSettingsNavigationPanel />
        </div>
        <ProjectAuthProvider
          me={currentUser}
          project={project}
          projectMember={projectMember ?? null}
        >
          <div className="col-span-3">
            <React.Suspense
              fallback={
                <DataTableSkeleton
                  columnCount={7}
                  filterCount={2}
                  cellWidths={[
                    "10rem",
                    "30rem",
                    "10rem",
                    "10rem",
                    "6rem",
                    "6rem",
                    "6rem",
                  ]}
                  shrinkZero
                />
              }
            >
              <AllEmployeesProvider
                allEmployeesPromise={getAllEmployees({ organizationId })}
              >
                <ProjectMembersProvider
                  membersPromise={getAllProjectMembers({
                    organizationId,
                    projectId,
                  })}
                >
                  <AllProjectRolesProvider
                    allProjectRolesPromise={getAllProjectRoles({
                      organizationId,
                      projectId,
                    })}
                  >
                    <AllRolesProvider
                      allRolesPromise={getAllRoles({ organizationId })}
                    >
                      <ProjectMembersTable
                        projectMembersPromise={getPaginatedProjectMembers({
                          ...search,
                          organizationId,
                          projectId,
                        })}
                      />
                    </AllRolesProvider>
                  </AllProjectRolesProvider>
                </ProjectMembersProvider>
              </AllEmployeesProvider>
            </React.Suspense>
          </div>
        </ProjectAuthProvider>
      </ProjectProvider>
    </main>
  );
}

type VerifyPageAccessProps = {
  organizationId: Organization["id"];
  projectId: Project["id"];
};

async function verifyPageAccess({
  organizationId,
  projectId,
}: VerifyPageAccessProps): Promise<{
  currentUser: Awaited<ReturnType<typeof getMe>>;
  projectMember?: Awaited<ReturnType<typeof getSelfProjectMembership> | null>;
}> {
  const currentUser = await getMe();

  const hasOrganizationAccess = currentUser.organization?.id === organizationId;

  if (!hasOrganizationAccess) {
    console.error(
      "🚫 Access denied: User does not have permission to access this resource."
    );
    notFound();
  }

  if (currentUser.isOrganizationAdmin) {
    return { currentUser };
  }

  try {
    // check if employee is a project member
    const projectMember = await getSelfProjectMembership({
      organizationId,
      projectId,
    });

    // check if member has PROJECT_MEMBER_VIEW permission let him access
    const hasViewPermission = projectMember.role?.permissions?.some(
      (permission) => permission.code === "PROJECT_MEMBER_VIEW"
    );
    if (!hasViewPermission) {
      console.error(
        "🚫 Access denied: User does not have permission to view project members."
      );
      throw NOT_FOUND_SERVER_ERROR;
    }

    return {
      currentUser,
      projectMember,
    };
  } catch (error) {
    if (error === NOT_FOUND_SERVER_ERROR) {
      console.error(
        "🚫 Access denied: User does not have permission to access this project."
      );
      notFound();
    }
    throw error;
  }
}
