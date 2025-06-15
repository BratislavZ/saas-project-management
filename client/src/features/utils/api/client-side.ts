"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { Me, MeSchema } from "../types/Me";

export const useMe = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<Me> => {
      const token = await getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/utils/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Me data");
      }

      const rawData = await response.json();

      const validatedData = MeSchema.parse(rawData);

      return validatedData;
    },
    gcTime: 0,
  });
};
