import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { validateRequest } from "../../shared/validation/validate-request";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { employeeValidationService } from "../../shared/services/employee-validation.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.patch(
  "/api/organization/:organizationId/employee/:employeeId",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  updateEmployeeHandler
);

const UpdateEmployeeSchema = z.object({
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
  body: z.object({
    name: z.string().min(1).max(32),
  }),
});

async function updateEmployeeHandler(req: Request, res: Response) {
  const safeData = await validateRequest(UpdateEmployeeSchema, req);

  const { organizationId, employeeId } = safeData.params;
  const { name } = safeData.body;

  const user = await prisma.employee.update({
    where: {
      id: employeeId,
      organizationId,
    },
    data: {
      name,
    },
    select: {
      id: true,
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Employee updated",
    userId: user.id,
  });
}

export { router as updateEmployeeRoute };
