export const ORGANIZATION_STATUSES = ["ACTIVE", "BANNED"] as const;
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];
