"use client";

import { createContext, useContext } from "react";
import { getAllProjectRoles } from "../api/get-allProjectRoles";
import { getAllRoles } from "../api/get-allRoles";

type TAllRolesPromise = Promise<Awaited<ReturnType<typeof getAllRoles>>>;

const AllRolesContext = createContext<TAllRolesPromise | null>(null);

export const useAllRolesPromise = () => {
  const food = useContext(AllRolesContext);
  if (!food)
    throw new Error(
      "useAllRolesPromise must be used within a AllRolesProvider"
    );
  return food;
};

const AllRolesProvider = ({
  children,
  allRolesPromise,
}: {
  children: React.ReactNode;
  allRolesPromise: TAllRolesPromise;
}) => {
  return (
    <AllRolesContext.Provider value={allRolesPromise}>
      {children}
    </AllRolesContext.Provider>
  );
};

export default AllRolesProvider;
