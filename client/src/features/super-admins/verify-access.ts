import { notFound } from "next/navigation";
import "server-only";
import { getMe } from "../utils/api/get-me";
import { Me } from "../utils/types/Me";

export async function verifySuperAdminAccess(): Promise<Me> {
  const currentUser = await getMe();

  if (!currentUser.isSuperAdmin) {
    console.error(
      "🚫 Access denied: User does not have permission to access this resource."
    );
    notFound();
  }

  return currentUser;
}
