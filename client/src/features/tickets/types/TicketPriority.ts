import { z } from "zod";

export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TicketPrioritySchema = z.enum(TICKET_PRIORITIES);
