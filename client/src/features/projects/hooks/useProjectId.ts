import { useParams } from "next/navigation";
import React from "react";
import { z } from "zod";

export const useProjectId = () => {
  const params = useParams();
  const projectId = z.coerce.number().int().positive().parse(params.projectId);

  return projectId;
};
