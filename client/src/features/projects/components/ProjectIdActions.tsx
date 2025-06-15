"use client";

import { Can } from "@/shared/components/custom/auth/Can";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Separator } from "@/shared/components/ui/separator";
import { PATHS } from "@/shared/lib/paths";
import { cn } from "@/shared/utils/tailwind";
import {
  EllipsisIcon,
  InfoIcon,
  PenSquareIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useProjectPromise } from "../providers/ProjectProvider";
import { getProjectStatusIcon } from "../utils";
import { ActivateProjectDialog } from "./dialogs/ActivateProjectDialog";
import { ArchiveProjectDialog } from "./dialogs/ArchiveProjectDialog";
import { EditProjectDialogWrapper } from "./dialogs/EditProjectDialogWrapper";
import { ViewProjectDetailsDialogWrapper } from "./dialogs/ViewProjectDetailsDialogWrapper";

type ProjectAction = "update" | "activate" | "archive" | "seeDetails";

export const ProjectIdActions = () => {
  const project = React.use(useProjectPromise());

  const isDisabled = project.status === "ARCHIVED";

  const [action, setAction] = React.useState<ProjectAction | null>(null);

  return (
    <>
      {/* Dialogs */}
      <ViewProjectDetailsDialogWrapper
        open={action === "seeDetails"}
        onOpenChange={() => setAction(null)}
        projectId={project.id}
      />
      <EditProjectDialogWrapper
        open={action === "update"}
        onOpenChange={() => setAction(null)}
        projectId={project.id}
      />
      <ArchiveProjectDialog
        open={action === "archive"}
        onOpenChange={() => setAction(null)}
        projectId={project.id}
      />
      <ActivateProjectDialog
        open={action === "activate"}
        onOpenChange={() => setAction(null)}
        projectId={project.id}
      />

      {/* Dropdown */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open menu"
              variant="outline"
              className="flex size-8 p-0 data-[state=open]:bg-muted"
            >
              <EllipsisIcon className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40 p-0">
            <div className="p-1">
              <DropdownMenuItem
                className="flex items-center gap-2"
                onSelect={() => setAction("seeDetails")}
              >
                <InfoIcon />
                View details
              </DropdownMenuItem>
              <Can permission="PROJECT_UPDATE">
                <DropdownMenuItem
                  disabled={isDisabled}
                  className="flex items-center gap-2"
                  onSelect={() => setAction("update")}
                >
                  <PenSquareIcon />
                  Edit
                </DropdownMenuItem>
              </Can>
              <Can permission="PROJECT_ARCHIVE">
                <DropdownMenuItem
                  className={cn(
                    "flex items-center gap-2",
                    project.status === "ARCHIVED" && "hidden"
                  )}
                  onSelect={() => setAction("archive")}
                >
                  {React.createElement(getProjectStatusIcon("ARCHIVED"))}
                  Archive
                </DropdownMenuItem>
              </Can>
              <Can permission="PROJECT_ACTIVATE">
                <DropdownMenuItem
                  className={cn(
                    "flex items-center gap-2",
                    project.status === "ACTIVE" && "hidden"
                  )}
                  onSelect={() => setAction("activate")}
                >
                  {React.createElement(getProjectStatusIcon("ACTIVE"))}
                  Activate
                </DropdownMenuItem>
              </Can>
            </div>

            <Can permission="PROJECT_MEMBER_VIEW">
              <Separator className="my-1 bg-border" />

              <div className="p-1">
                <Link
                  href={PATHS.EMPLOYEE.projectIdSettings.members(
                    project.organization.id,
                    project.id
                  )}
                >
                  <DropdownMenuItem className="flex items-center gap-2">
                    <SettingsIcon />
                    Settings
                  </DropdownMenuItem>
                </Link>
              </div>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export const ProjectIdActionsSkeleton = () => {
  return (
    <Button disabled variant="outline" className="flex size-8 p-0">
      <EllipsisIcon className="size-4" aria-hidden="true" />
    </Button>
  );
};
