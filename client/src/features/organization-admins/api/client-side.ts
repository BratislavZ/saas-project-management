import { useQuery } from "@tanstack/react-query";
import {
  OrganizationAdmin,
  OrganizationAdminSchema,
} from "../types/OrganizationAdmin";
import { useAuth } from "@clerk/nextjs";

export const useOrganizationAdmin = (
  organizationAdminId?: OrganizationAdmin["id"]
) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["organization-admin", organizationAdminId],
    queryFn: async (): Promise<OrganizationAdmin> => {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization-admin/${organizationAdminId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch organization admin data");
      }

      const rawData = await response.json();

      // Validate the response data against the schema
      const validatedData = OrganizationAdminSchema.parse(rawData);

      return validatedData;
    },
    enabled: !!organizationAdminId,
    gcTime: 0,
  });
};
