import { getMe } from "@/features/utils/api/get-me";
import { PATHS } from "@/shared/lib/paths";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET() {
  await auth.protect();

  const { isOrganizationAdmin, isSuperAdmin, organization, status } =
    await getMe();

  // super-admin
  if (isSuperAdmin) {
    redirect(PATHS.SUPER_ADMIN.organizations);
  }

  // check if organization is active
  // and user is active
  if (
    !organization ||
    organization.status !== "ACTIVE" ||
    status !== "ACTIVE"
  ) {
    redirect(PATHS.OTHER.accessDenied);
  }

  // organization-admin
  if (isOrganizationAdmin) {
    redirect(PATHS.ORGANIZATION_ADMIN.projects(organization.id));
  }

  // user
  redirect(PATHS.EMPLOYEE.projects(organization.id));
}
