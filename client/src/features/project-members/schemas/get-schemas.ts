import { getSortingStateParser } from "@/shared/components/custom/data-table/lib/parsers";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import { ProjectMember } from "../types/ProjectMember";

export const projectMembersSearchParamsCache = createSearchParamsCache({
  pageNumber: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<ProjectMember>(),
  searchTerm: parseAsString.withDefault(""),
  role: parseAsInteger,
});

export type GetProjectMembersSchema = Awaited<
  ReturnType<typeof projectMembersSearchParamsCache.parse>
>;
