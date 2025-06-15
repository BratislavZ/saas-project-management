"use client";

import { ProjectMember } from "@/features/project-members/types/ProjectMember";
import { Permission } from "@/features/roles/types/Permission";
import { Me } from "@/features/utils/types/Me";
import { ProjectAuthorizationService } from "@/shared/lib/auth/project-auth-service";
import { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { Project } from "../types/Project";

// No more promises needed here!
type ProjectAuthContextType = ProjectAuthorizationService | null;

const ProjectAuthContext = createContext<ProjectAuthContextType>(null);

type ProjectAuthProviderProps = {
  children: ReactNode;
  me: Me;
  project: Project;
  projectMember: ProjectMember | null; // Null for OrgAdmins
};

export const ProjectAuthProvider: FC<ProjectAuthProviderProps> = ({
  children,
  me,
  project,
  projectMember,
}) => {
  const authService = useMemo(() => {
    // Extract the permissions from the member object here.
    const permissions = new Set(
      projectMember?.role?.permissions?.map(
        (p) => p.code as Permission["code"]
      ) || []
    );
    // Instantiate our new, simpler service.
    return new ProjectAuthorizationService(me, project, permissions);
  }, [me, project, projectMember]);

  return (
    <ProjectAuthContext.Provider value={authService}>
      {children}
    </ProjectAuthContext.Provider>
  );
};

export const useProjectAuthorization = () => {
  const context = useContext(ProjectAuthContext);
  if (context === null) {
    throw new Error(
      "useProjectAuthorization must be used within a ProjectAuthProvider"
    );
  }
  return context;
};
