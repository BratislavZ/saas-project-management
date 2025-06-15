import { useQuery } from "@tanstack/react-query";
import { Employee, EmployeeSchema } from "../types/Employee";
import { useAuth } from "@clerk/nextjs";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";

export const useEmployee = (employeeId?: Employee["id"]) => {
  const { getToken } = useAuth();
  const organizationId = useOrganizationId();

  return useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async (): Promise<Employee> => {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/${organizationId}/employee/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch employee data");
      }

      const rawData = await response.json();

      // Validate the response data against the schema
      const validatedData = EmployeeSchema.parse(rawData);

      return validatedData;
    },
    enabled: !!employeeId,
    gcTime: 0,
  });
};
