import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { Ticket, TicketSchema } from "../types/Ticket";
import {
  BasicTicketColumn,
  BasicTicketColumnSchema,
  TicketColumn,
} from "../types/TicketColumn";
import { useProjectId } from "@/features/projects/hooks/useProjectId";
import { Project } from "@/features/projects/types/Project";

type Props = {
  ticketId?: Ticket["id"];
  projectId?: Project["id"];
};

export const useTicket = ({ projectId, ticketId }: Props) => {
  const { getToken } = useAuth();
  const organizationId = useOrganizationId();

  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async (): Promise<Ticket> => {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/${organizationId}/project/${projectId}/ticket/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch ticket data");
      }

      const rawData = await response.json();

      // Validate the response data against the schema
      const validatedData = TicketSchema.parse(rawData);

      return validatedData;
    },
    enabled: !!ticketId,
    gcTime: 0,
  });
};

export const useTicketColumn = (columnId?: TicketColumn["id"]) => {
  const { getToken } = useAuth();
  const organizationId = useOrganizationId();
  const projectId = useProjectId();

  return useQuery({
    queryKey: ["ticket-column", columnId],
    queryFn: async (): Promise<BasicTicketColumn> => {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/${organizationId}/project/${projectId}/column/${columnId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch column data");
      }

      const rawData = await response.json();

      // Validate the response data against the schema
      const validatedData = BasicTicketColumnSchema.parse(rawData);

      return validatedData;
    },
    enabled: !!columnId,
    gcTime: 0,
  });
};
