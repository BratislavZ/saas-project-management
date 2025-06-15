import { useQuery } from "@tanstack/react-query";
import { Role, RoleSchema } from "../types/Role";
import { useAuth } from "@clerk/nextjs";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";

export const useRole = (roleId?: Role["id"]) => {
  const { getToken } = useAuth();
  const organizationId = useOrganizationId();

  return useQuery({
    queryKey: ["role", roleId],
    queryFn: async (): Promise<Role> => {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/${organizationId}/role/${roleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch role data");
      }

      const rawData = await response.json();

      // Validate the response data against the schema
      const validatedData = RoleSchema.parse(rawData);

      return validatedData;
    },
    enabled: !!roleId,
    gcTime: 0,
  });
};
