"use client";

import { createContext, useContext } from "react";
import { getAllProjectRoles } from "../api/get-allProjectRoles";

type TAllProjectRolesPromise = Promise<
  Awaited<ReturnType<typeof getAllProjectRoles>>
>;

const AllProjectRolesContext = createContext<TAllProjectRolesPromise | null>(
  null
);

export const useAllProjectRolesPromise = () => {
  const food = useContext(AllProjectRolesContext);
  if (!food)
    throw new Error(
      "useAllProjectRolesPromise must be used within a AllProjectRolesProvider"
    );
  return food;
};

const AllProjectRolesProvider = ({
  children,
  allProjectRolesPromise: projectPromise,
}: {
  children: React.ReactNode;
  allProjectRolesPromise: TAllProjectRolesPromise;
}) => {
  return (
    <AllProjectRolesContext.Provider value={projectPromise}>
      {children}
    </AllProjectRolesContext.Provider>
  );
};

export default AllProjectRolesProvider;
