import { getSortingStateParser } from "@/shared/components/custom/data-table/lib/parsers";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import * as z from "zod";
import { OrganizationAdmin } from "../types/OrganizationAdmin";
import { USER_STATUSES } from "../../utils/types/UserStatus";

export const searchParamsCache = createSearchParamsCache({
  pageNumber: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<OrganizationAdmin>(),
  searchTerm: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(USER_STATUSES)).withDefault([]),
});

export type GetOrganizationAdminsSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
