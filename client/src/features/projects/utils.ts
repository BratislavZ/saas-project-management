import { ArchiveIcon, CheckCircle2, LucideProps } from "lucide-react";
import { Project } from "./types/Project";

export function getProjectStatusIcon(status: Project["status"]) {
  const statusIcons: Record<
    Project["status"],
    React.ComponentType<LucideProps>
  > = {
    ACTIVE: CheckCircle2,
    ARCHIVED: ArchiveIcon,
  };

  return statusIcons[status];
}

export function generateColumnIdentifier(columnId: number): string {
  return `column-${columnId}`;
}
export function extractColumnId(columnIdentifier: string): number {
  const [_prefix, id] = columnIdentifier.split("-");
  return Number(id);
}
