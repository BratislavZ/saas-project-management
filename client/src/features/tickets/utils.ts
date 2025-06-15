import { TicketPriority } from "./types/TicketPriority";
import { Badge } from "@/shared/components/ui/badge";

export function getTicketPriorityBadge(priority: TicketPriority) {
  const ticketPriority: Record<
    TicketPriority,
    React.ReactElement<typeof Badge>
  > = {
    CRITICAL: Badge({
      className: "bg-red-500 text-white",
      children: "CRITICAL",
    }),
    HIGH: Badge({ className: "bg-orange-500 text-white", children: "HIGH" }),
    MEDIUM: Badge({
      className: "bg-yellow-500 text-white",
      children: "MEDIUM",
    }),
    LOW: Badge({ className: "bg-dark-500 text-white", children: "LOW" }),
  };

  return ticketPriority[priority];
}
