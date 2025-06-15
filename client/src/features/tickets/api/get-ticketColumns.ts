import "server-only";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import { Organization } from "@/features/organizations/types/Organization";
import { Project } from "@/features/projects/types/Project";
import { TicketColumn, TicketColumnSchema } from "../types/TicketColumn";
import { buildURL } from "@/shared/utils/build-url"; // Assuming this utility is available
import { GetTicketColumnsSchema } from "../schemas/get-schemas";

type Input = GetTicketColumnsSchema & {
  organizationId: Organization["id"];
  projectId: Project["id"];
};

export async function getTicketColumns({
  organizationId,
  projectId,
  searchTerm,
  assigneeId,
  priority,
}: Input): Promise<Array<TicketColumn>> {
  const { getToken } = await auth.protect();

  try {
    const token = await getToken();

    const url = buildURL({
      basePath: `${process.env.API_URL}/api/organization/${organizationId}/project/${projectId}/columns`,
      queryParams: {
        searchTerm,
        assigneeId,
        priority,
      },
    });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      await logBadResponse(response);
      throw new Error("Failed to get columns");
    }

    const data: unknown = await response.json();

    const validationSchema = z.array(TicketColumnSchema);
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "Zod validation error in getTicketColumns:",
        fromError(error)
      );
    } else {
      console.error("Error in getTicketColumns:", error);
    }
    throw error;
  }
}
