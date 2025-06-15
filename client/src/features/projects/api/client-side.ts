import { useQuery } from "@tanstack/react-query";
import { Project, ProjectSchema } from "../types/Project";
import { useAuth } from "@clerk/nextjs";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";

export const useProject = (projectId?: Project["id"]) => {
  const { getToken } = useAuth();
  const organizationId = useOrganizationId();

  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async (): Promise<Project> => {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/${organizationId}/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch project data");
      }

      const rawData = await response.json();

      // Validate the response data against the schema
      const validatedData = ProjectSchema.parse(rawData);

      return validatedData;
    },
    enabled: !!projectId,
    gcTime: 0,
  });
};
