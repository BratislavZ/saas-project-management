"use client";

import { createContext, useContext } from "react";
import { getAllProjectMembers } from "../api/get-allProjectMembers";

type TProjectMembersPromise = Promise<
  Awaited<ReturnType<typeof getAllProjectMembers>>
>;

const ProjectMembersContext = createContext<TProjectMembersPromise | null>(
  null
);

export const useProjectMembersPromise = () => {
  const food = useContext(ProjectMembersContext);
  if (!food)
    throw new Error(
      "useProjectMembersPromise must be used within a ProjectMembersProvider"
    );
  return food;
};

const ProjectMembersProvider = ({
  children,
  membersPromise,
}: {
  children: React.ReactNode;
  membersPromise: TProjectMembersPromise;
}) => {
  return (
    <ProjectMembersContext.Provider value={membersPromise}>
      {children}
    </ProjectMembersContext.Provider>
  );
};

export default ProjectMembersProvider;
