import { BanIcon, CheckCircle2, LucideProps } from "lucide-react";
import { OrganizationAdmin } from "./types/OrganizationAdmin";

export function getOrganizationAdminStatusIcon(
  status: OrganizationAdmin["user"]["status"]
) {
  const statusIcons: Record<
    OrganizationAdmin["user"]["status"],
    React.ComponentType<LucideProps>
  > = {
    ACTIVE: CheckCircle2,
    BANNED: BanIcon,
  };

  return statusIcons[status];
}
