import { getAllProjectMembers } from "@/features/project-members/api/get-allProjectMembers";
import ProjectMembersProvider from "@/features/project-members/providers/ProjectMembersProvider";
import { getProject } from "@/features/projects/api/get-project";
import {
  KanbanTickets,
  KanbanTicketsSkeleton,
  ResetFiltersButton,
} from "@/features/projects/components/KanbanTickets";
import ProjectIdDetails, {
  ProjectIdDetailsSkeleton,
} from "@/features/projects/components/ProjectDetails";
import {
  ProjectIdActions,
  ProjectIdActionsSkeleton,
} from "@/features/projects/components/ProjectIdActions";
import SearchTickets from "@/features/projects/components/SearchTickets";
import { ProjectAuthProvider } from "@/features/projects/providers/ProjectAuthProvider";
import ProjectProvider from "@/features/projects/providers/ProjectProvider";
import {
  verifyProjectAccess,
  verifyProjectIdValid,
} from "@/features/projects/verify-access";
import { getTicketColumns } from "@/features/tickets/api/get-ticketColumns";
import { CreateTicketColumnDialog } from "@/features/tickets/components/dialogs/CreateTicketColumnDialog";
import { CreateTicketSheet } from "@/features/tickets/components/sheets/CreateTicketSheet";
import TicketColumnsProvider from "@/features/tickets/providers/TicketColumnsProvider";
import { ticketColumnsSearchParamsCache } from "@/features/tickets/schemas/get-schemas";
import { Can } from "@/shared/components/custom/auth/Can";
import { AssigneeFilter } from "@/shared/components/specific/filters/AssigneeFilter";
import { PriorityFilter } from "@/shared/components/specific/filters/PriorityFilter";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/lib/paths";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeftIcon } from "lucide-react";
import { Params } from "next/dist/server/request/params";
import { SearchParams } from "next/dist/server/request/search-params";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

type PageParams = {
  searchParams: Promise<SearchParams>;
  params: Promise<Params>;
};

const projectParamsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
  projectId: z.coerce.number().int().positive(),
});

export default async function ProjectIdPage(props: PageParams) {
  await auth.protect();

  const [searchParams, params] = await Promise.all([
    props.searchParams,
    props.params,
  ]);

  const { organizationId, projectId } = projectParamsSchema.parse(params);
  const search = ticketColumnsSearchParamsCache.parse(searchParams);

  // authorization check
  const { currentUser, projectMember } = await verifyProjectAccess({
    organizationId,
    projectId,
  });
  // ensure projectId is valid
  const { project } = await verifyProjectIdValid({
    organizationId,
    projectId,
  });

  const backLinkPath = currentUser.isOrganizationAdmin
    ? PATHS.ORGANIZATION_ADMIN.projects(organizationId)
    : PATHS.EMPLOYEE.projects(organizationId);

  return (
    <ProjectAuthProvider
      me={currentUser}
      project={project}
      projectMember={projectMember ?? null}
    >
      <div className="grid space-y-6">
        <Link href={backLinkPath} className="w-fit">
          <Button variant={"outline"} type="button" size={"sm"}>
            <ArrowLeftIcon />
            Projects
          </Button>
        </Link>

        <ProjectProvider
          projectPromise={getProject({ organizationId, projectId })}
        >
          <div className="flex items-center justify-between gap-2">
            <Suspense fallback={<ProjectIdDetailsSkeleton />}>
              <ProjectIdDetails />
            </Suspense>
            <Suspense fallback={<ProjectIdActionsSkeleton />}>
              <ProjectIdActions />
            </Suspense>
          </div>

          <TicketColumnsProvider
            ticketColumnsPromise={getTicketColumns({
              ...search,
              organizationId,
              projectId,
            })}
          >
            <ProjectMembersProvider
              membersPromise={getAllProjectMembers({
                organizationId,
                projectId,
              })}
            >
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SearchTickets />
                    <AssigneeFilter />
                    <PriorityFilter />
                    <ResetFiltersButton />
                  </div>
                  <div className="flex items-center gap-2">
                    <Can permission="TICKET_COLUMN_CREATE">
                      <CreateTicketColumnDialog />
                    </Can>
                    <Can permission="TICKET_CREATE">
                      <CreateTicketSheet />
                    </Can>
                  </div>
                </div>

                <Suspense fallback={<KanbanTicketsSkeleton />}>
                  <KanbanTickets />
                </Suspense>
              </div>
            </ProjectMembersProvider>
          </TicketColumnsProvider>
        </ProjectProvider>
      </div>
    </ProjectAuthProvider>
  );
}
