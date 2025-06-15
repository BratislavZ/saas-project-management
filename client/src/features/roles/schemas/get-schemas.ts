import { getSortingStateParser } from "@/shared/components/custom/data-table/lib/parsers";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import * as z from "zod";
import { Role } from "../types/Role";
import { PROJECT_STATUSES } from "@/features/utils/types/ProjectStatus";

export const rolesSearchParamsCache = createSearchParamsCache({
  pageNumber: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Role>(),
  searchTerm: parseAsString.withDefault(""),
});

export type GetRolesSchema = Awaited<
  ReturnType<typeof rolesSearchParamsCache.parse>
>;

export const roleEmployeesSearchParamsCache = createSearchParamsCache({
  pageNumber: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  searchTerm: parseAsString.withDefault(""),
});
export type GetRoleEmployeesSchema = Awaited<
  ReturnType<typeof roleEmployeesSearchParamsCache.parse>
>;
