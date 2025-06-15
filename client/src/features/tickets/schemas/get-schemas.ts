import { getSortingStateParser } from "@/shared/components/custom/data-table/lib/parsers";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsIsoDateTime,
} from "nuqs/server";
import * as z from "zod";
import { SelfTicket } from "../types/SelfTicket";
import { TICKET_TYPES } from "../types/TicketType";
import { TICKET_PRIORITIES } from "../types/TicketPriority";

export const selfTicketsSearchParamsCache = createSearchParamsCache({
  pageNumber: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<SelfTicket>(),
  searchTerm: parseAsString.withDefault(""),
  type: parseAsArrayOf(z.enum(TICKET_TYPES)).withDefault([]),
  priority: parseAsArrayOf(z.enum(TICKET_PRIORITIES)).withDefault([]),
  project: parseAsInteger,
  dueDate: parseAsIsoDateTime,
});
export type GetSelfTicketsSchema = Awaited<
  ReturnType<typeof selfTicketsSearchParamsCache.parse>
>;
export const selfTicketsParamsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
});

export const ticketColumnsFilterParsers = {
  searchTerm: parseAsString.withDefault(""),
  assigneeId: parseAsInteger,
  priority: parseAsString.withDefault(""),
};
export const ticketColumnsSearchParamsCache = createSearchParamsCache(
  ticketColumnsFilterParsers
);
export type GetTicketColumnsSchema = Awaited<
  ReturnType<typeof ticketColumnsSearchParamsCache.parse>
>;
