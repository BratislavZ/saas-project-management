import { useQuery } from "@tanstack/react-query";
import { Organization, OrganizationSchema } from "../types/Organization";
import { useAuth } from "@clerk/nextjs";
import { z } from "zod";

export const useOrganization = (organizationId?: number) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async (): Promise<Organization> => {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch organization data");
      }

      const rawData = await response.json();

      // Validate the response data against the schema
      const validatedData = OrganizationSchema.parse(rawData);

      return validatedData;
    },
    enabled: !!organizationId,
    gcTime: 0,
  });
};
