"use client";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/tailwind";
import React from "react";
import { getProjectStatusIcon } from "../utils";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useProjectPromise } from "../providers/ProjectProvider";

type Props = {
  titleClassName?: string;
};

const ProjectIdDetails = ({ titleClassName }: Props) => {
  const project = React.use(useProjectPromise());

  const Icon = getProjectStatusIcon(project.status);
  const isArchived = project.status === "ARCHIVED";

  return (
    <div className="flex items-center gap-2">
      <h1 className={cn("text-3xl font-bold", titleClassName)}>
        {project.name}
      </h1>
      {isArchived && (
        <Badge variant={"archived"} className={cn("py-1 [&>svg]:size-3.5")}>
          <Icon />
          <span className="lowercase">{project.status}</span>
        </Badge>
      )}
    </div>
  );
};

export default ProjectIdDetails;

export function ProjectIdDetailsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-64" /> {/* Title skeleton */}
      <Skeleton className="h-6 w-20" /> {/* Badge skeleton */}
    </div>
  );
}
