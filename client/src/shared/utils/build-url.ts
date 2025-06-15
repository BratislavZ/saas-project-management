/**
 * Builds a complete URL with base path and query parameters,
 * filtering out undefined and empty string values
 * @param basePath - Base API endpoint path
 * @param params - Object containing query parameters
 * @returns Complete URL with query string
 */
export const buildURL = <T extends Record<string, any>>({
  basePath,
  queryParams,
}: {
  basePath: string;
  queryParams: T;
}): string => {
  const queryString = Object.entries(queryParams)
    .filter(
      ([_, value]) => value !== undefined && value !== "" && value !== null
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  return `${basePath}${queryString ? `?${queryString}` : ""}`;
};
