import { z } from "zod";

export function paginateSchema<T extends z.ZodTypeAny>(schema: T) {
  return z.strictObject({
    items: z.array(schema),
    pageNumber: z.number(),
    totalPages: z.number(),
    totalCount: z.number(),
    hasPreviousPage: z.boolean(),
    hasNextPage: z.boolean(),
  });
}

export type Paginated<T> = z.infer<
  ReturnType<typeof paginateSchema<z.ZodType<T>>>
>;

export const PaginationParamsSchema = z.object({
  pageNumber: z.coerce.number().int().positive(),
  pageSize: z.coerce.number().int().positive(),
});
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export const SortDirectionSchema = z.enum(["asc", "desc"]).default("asc");
export type SortDirection = z.infer<typeof SortDirectionSchema>;

export const SortParamsSchema = z.object({
  sortKey: z.string().optional(),
  direction: SortDirectionSchema.optional(),
});
export type SortParams = z.infer<typeof SortParamsSchema>;

export const FilterParamsSchema = z.object({
  searchTerm: z.string().optional(),
});
export type FilterParams = z.infer<typeof FilterParamsSchema>;
