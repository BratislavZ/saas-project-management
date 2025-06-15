import { getSortingStateParser } from "@/shared/components/custom/data-table/lib/parsers";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import * as z from "zod";
import { Project } from "../types/Project";
import { PROJECT_STATUSES } from "@/features/utils/types/ProjectStatus";

export const projectsSearchParamsCache = createSearchParamsCache({
  pageNumber: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Project>(),
  searchTerm: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(PROJECT_STATUSES)).withDefault([]),
});

export type GetProjectsSchema = Awaited<
  ReturnType<typeof projectsSearchParamsCache.parse>
>;

export const projectsParamsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
});

export const selfProjectsSearchParamsCache = createSearchParamsCache({
  pageNumber: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Project>(),
  searchTerm: parseAsString.withDefault(""),
  role: parseAsString.withDefault(""),
});
export type GetSelfProjectsSchema = Awaited<
  ReturnType<typeof selfProjectsSearchParamsCache.parse>
>;
export const selfProjectsParamsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
});
