import { useParams } from "next/navigation";
import { z } from "zod";

export const useRoleId = () => {
  const params = useParams();
  const roleId = z.coerce.number().int().positive().parse(params.roleId);

  return roleId;
};
