"use client";

import { createContext, useContext } from "react";
import { getAllEmployees } from "../api/get-allEmployees";

type TAllEmployeesPromise = Promise<
  Awaited<ReturnType<typeof getAllEmployees>>
>;

const AllEmployeesContext = createContext<TAllEmployeesPromise | null>(null);

export const useAllEmployeesPromise = () => {
  const employees = useContext(AllEmployeesContext);
  if (!employees)
    throw new Error(
      "useAllEmployeesPromise must be used within a AllEmployeesProvider"
    );
  return employees;
};

const AllEmployeesProvider = ({
  children,
  allEmployeesPromise,
}: {
  children: React.ReactNode;
  allEmployeesPromise: TAllEmployeesPromise;
}) => {
  return (
    <AllEmployeesContext.Provider value={allEmployeesPromise}>
      {children}
    </AllEmployeesContext.Provider>
  );
};

export default AllEmployeesProvider;
