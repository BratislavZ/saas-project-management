import { getSortingStateParser } from "@/shared/components/custom/data-table/lib/parsers";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import * as z from "zod";
import { Organization } from "../types/Organization";
import { ORGANIZATION_STATUSES } from "../types/OrganizationStatus";

export const organizationAdminsSearchParamsCache = createSearchParamsCache({
  pageNumber: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Organization>(),
  searchTerm: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(ORGANIZATION_STATUSES)).withDefault([]),
  organizationId: parseAsInteger,
});

export type GetOrganizationsSchema = Awaited<
  ReturnType<typeof organizationAdminsSearchParamsCache.parse>
>;
