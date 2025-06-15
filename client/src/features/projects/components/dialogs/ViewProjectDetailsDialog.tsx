import React from "react";
import { Project } from "../../types/Project";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { getProjectStatusIcon } from "../../utils";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/tailwind";
import { format } from "date-fns";

type Props = {
  project: Project;
};

export const ViewProjectDetailsDialog = ({ project }: Props) => {
  const StatusIcon = getProjectStatusIcon(project.status);

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="text-left">
        <DialogTitle className="flex items-center gap-2">
          <span>{project.name}</span>
          <Badge
            variant={project.status === "ACTIVE" ? "success" : "archived"}
            className={cn("py-1 [&>svg]:size-3.5")}
          >
            <StatusIcon />
            <span className="lowercase">{project.status}</span>
          </Badge>
        </DialogTitle>
        <DialogDescription>{project.description}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <p className="text-dark-600 font-semibold">Organization</p>
          <p className="col-span-3">{project.organization.name}</p>
        </div>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <p className="text-dark-600 font-semibold">Created</p>
          <p className="col-span-3">
            {format(project.createdAt, "MMMM dd, yyyy")}
          </p>
        </div>
      </div>
      <DialogFooter className="gap-2 pt-2 sm:space-x-0">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
};
