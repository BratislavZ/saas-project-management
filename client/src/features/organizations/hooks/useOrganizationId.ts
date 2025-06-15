import { useParams } from "next/navigation";
import React from "react";
import { z } from "zod";

export const useOrganizationId = () => {
  const params = useParams();
  const organizationId = z.coerce
    .number()
    .int()
    .positive()
    .parse(params.organizationId);

  return organizationId;
};
