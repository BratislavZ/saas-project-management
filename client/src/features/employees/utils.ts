import { BanIcon, CheckCircle2, LucideProps } from "lucide-react";
import { Employee } from "./types/Employee";

export function getEmployeeStatusIcon(status: Employee["user"]["status"]) {
  const statusIcons: Record<
    Employee["user"]["status"],
    React.ComponentType<LucideProps>
  > = {
    ACTIVE: CheckCircle2,
    BANNED: BanIcon,
  };

  return statusIcons[status];
}
