import "server-only";

import { NOT_FOUND_SERVER_ERROR } from "@/shared/lib/error";
import { notFound } from "next/navigation";
import "server-only";
import { Organization } from "../organizations/types/Organization";
import { getRole } from "./api/get-role";
import { Role } from "./types/Role";

type VerifyRoleIdAccessParams = {
  organizationId: Organization["id"];
  roleId: Role["id"];
};

export async function verifyRoleIdValid(params: VerifyRoleIdAccessParams) {
  try {
    const role = await getRole(params);
    return { role };
  } catch (error) {
    if (error === NOT_FOUND_SERVER_ERROR) {
      notFound();
    }
    throw error;
  }
}
