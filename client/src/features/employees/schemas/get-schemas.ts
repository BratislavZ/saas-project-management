import { getSortingStateParser } from "@/shared/components/custom/data-table/lib/parsers";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import * as z from "zod";
import { Employee } from "../types/Employee";
import { USER_STATUSES } from "../../utils/types/UserStatus";

export const employeesSearchParamsCache = createSearchParamsCache({
  pageNumber: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Employee>(),
  searchTerm: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(USER_STATUSES)).withDefault([]),
  projectId: parseAsInteger,
});

export type GetEmployeesSchema = Awaited<
  ReturnType<typeof employeesSearchParamsCache.parse>
>;

export const employeesParamsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
});
