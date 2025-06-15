import "server-only";
import { Paginated, paginateSchema } from "@/shared/types/Pagination";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { fromError } from "zod-validation-error";
import { buildURL } from "@/shared/utils/build-url";
import { SelfTicket, SelfTicketSchema } from "../types/SelfTicket";
import { GetSelfTicketsSchema } from "../schemas/get-schemas";

type Input = GetSelfTicketsSchema & {
  organizationId: number;
};

export async function getPaginatedSelfTickets(
  input: Input
): Promise<Paginated<SelfTicket>> {
  const { getToken } = await auth.protect();

  try {
    const {
      pageNumber,
      pageSize,
      sort,
      searchTerm,
      organizationId,
      dueDate,
      priority,
      project,
      type,
    } = input;
    const token = await getToken();

    const sortBy = sort?.[0]?.id;
    const sortDirection = sort?.[0]?.desc ? "desc" : undefined;

    const response = await fetch(
      buildURL({
        basePath: `${process.env.API_URL}/api/organization/${organizationId}/self/tickets-paginated`,
        queryParams: {
          searchTerm,
          sortBy,
          sortDirection,
          pageNumber,
          pageSize,
          dueDate,
          priority: priority[0],
          project,
          type: type[0],
        },
      }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      await logBadResponse(response);
      throw new Error("Failed to get tickets");
    }

    const data: unknown = await response.json();

    const validationSchema = paginateSchema(SelfTicketSchema);
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
