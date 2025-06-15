import { BanIcon, CheckCircle2, LucideProps } from "lucide-react";

import { Organization } from "./types/Organization";

export function getOrganizationStatusIcon(status: Organization["status"]) {
  const statusIcons: Record<
    Organization["status"],
    React.ComponentType<LucideProps>
  > = {
    ACTIVE: CheckCircle2,
    BANNED: BanIcon,
  };

  return statusIcons[status];
}
