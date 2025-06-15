"use client";

import { createContext, useContext } from "react";
import { getTicketColumns } from "../api/get-ticketColumns";

type TTicketColumnsPromise = Promise<
  Awaited<ReturnType<typeof getTicketColumns>>
>;

const ProjectContext = createContext<TTicketColumnsPromise | null>(null);

export const useTicketColumnsPromise = () => {
  const food = useContext(ProjectContext);
  if (!food)
    throw new Error(
      "useTicketColumnsPromise must be used within a TicketColumnsProvider"
    );
  return food;
};

const TicketColumnsProvider = ({
  children,
  ticketColumnsPromise,
}: {
  children: React.ReactNode;
  ticketColumnsPromise: TTicketColumnsPromise;
}) => {
  return (
    <ProjectContext.Provider value={ticketColumnsPromise}>
      {children}
    </ProjectContext.Provider>
  );
};

export default TicketColumnsProvider;
