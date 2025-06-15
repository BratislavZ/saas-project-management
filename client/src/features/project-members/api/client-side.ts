import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { Project } from "@/features/projects/types/Project";
import { ProjectMember, ProjectMemberSchema } from "../types/ProjectMember";

type Props = {
  memberId?: ProjectMember["id"];
  projectId?: Project["id"];
};

export const useProjectMember = ({ projectId, memberId }: Props) => {
  const { getToken } = useAuth();
  const organizationId = useOrganizationId();

  return useQuery({
    queryKey: ["project-member", memberId],
    queryFn: async (): Promise<ProjectMember> => {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/${organizationId}/project/${projectId}/member/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch member data");
      }

      const rawData = await response.json();

      const validatedData = ProjectMemberSchema.parse(rawData);

      return validatedData;
    },
    enabled: !!memberId,
    gcTime: 0,
  });
};
