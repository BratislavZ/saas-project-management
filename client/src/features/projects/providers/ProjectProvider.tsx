"use client";

import { createContext, useContext } from "react";
import { getProject } from "../api/get-project";

type TProjectPromise = Promise<Awaited<ReturnType<typeof getProject>>>;

const ProjectContext = createContext<TProjectPromise | null>(null);

export const useProjectPromise = () => {
  const food = useContext(ProjectContext);
  if (!food)
    throw new Error("useProjectPromise must be used within a ProjectProvider");
  return food;
};

const ProjectProvider = ({
  children,
  projectPromise,
}: {
  children: React.ReactNode;
  projectPromise: TProjectPromise;
}) => {
  return (
    <ProjectContext.Provider value={projectPromise}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectProvider;
