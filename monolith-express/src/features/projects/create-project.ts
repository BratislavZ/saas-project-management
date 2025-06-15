import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";

const router = Router();

router.post(
  "/api/organization/:organizationId/project",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  createProjectHandler
);

const CreateProjectSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
  }),
  body: z.object({
    name: z.string().min(1).max(32),
    description: z.string().optional(),
  }),
});

async function createProjectHandler(req: Request, res: Response) {
  const safeData = await validateRequest(CreateProjectSchema, req);
  const { name, description } = safeData.body;
  const { organizationId } = safeData.params;

  const newProject = await prisma.project.create({
    data: {
      name,
      description,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  res.status(StatusCodes.CREATED).json({
    message: "Project created",
    userId: newProject.id,
  });
}

export { router as createProjectRoute };
