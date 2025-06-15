import { Request, Response, Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { employeeValidationService } from "../../shared/services/employee-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";

const router = Router();

router.delete(
  "/api/organization/:organizationId/employee/:employeeId/ban",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  banEmployeeHandler
);

const BanEmployeeSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      employeeId: z.coerce.number().int().positive(),
    })
    .refine(
      async ({ organizationId, employeeId }) => {
        return await employeeValidationService.isEmployeeInOrganization(
          organizationId,
          employeeId
        );
      },
      {
        message: "Employee does not exist",
      }
    ),
});

async function banEmployeeHandler(req: Request, res: Response) {
  const safeData = await validateRequest(BanEmployeeSchema, req);

  const { employeeId } = safeData.params;

  await prisma.user.update({
    where: {
      employeeId,
    },
    data: {
      status: "BANNED",
    },
    select: {
      id: true,
    },
  });

  res.sendStatus(StatusCodes.NO_CONTENT);
}

export { router as banEmployeeRoute };
