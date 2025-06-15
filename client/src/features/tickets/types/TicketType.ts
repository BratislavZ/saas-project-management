import { z } from "zod";

export const TICKET_TYPES = [
  "BUG",
  "FEATURE",
  "TASK",
  "IMPROVEMENT",
  "DOCUMENTATION",
] as const;

export type TicketType = (typeof TICKET_TYPES)[number];

export const TicketTypeSchema = z.enum(TICKET_TYPES);
