import "server-only";

import { notFound } from "next/navigation";
import "server-only";
import { Organization } from "../organizations/types/Organization";
import { getMe } from "../utils/api/get-me";
import { Me } from "../utils/types/Me";

export async function verifyEmployeeAccess(
  organizationId: Organization["id"]
): Promise<Me> {
  const currentUser = await getMe();

  if (currentUser.organization?.id !== organizationId) {
    console.error(
      "🚫 Access denied: User does not have permission to access this resource."
    );
    notFound();
  }

  if (currentUser.isOrganizationAdmin) {
    console.error(
      "🚫 Access denied: Organization admins cannot access employee resources."
    );
    notFound();
  }

  return currentUser;
}
