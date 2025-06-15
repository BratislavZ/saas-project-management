export const USER_STATUSES = ["ACTIVE", "BANNED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];
