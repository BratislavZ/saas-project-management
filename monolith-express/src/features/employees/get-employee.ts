import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { validateRequest } from "../../shared/validation/validate-request";
import { NotFoundError } from "../../shared/errors/not-found-error";

import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { employeeValidationService } from "../../shared/services/employee-validation.service";
import { EmployeeDTO, EmployeeDTOSchema } from "./utils/dtos";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.get(
  "/api/organization/:organizationId/employee/:employeeId",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  getEmployeeHandler
);

const GetEmployeeSchema = z.object({
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

async function getEmployeeHandler(req: Request, res: Response<EmployeeDTO>) {
  const safeData = await validateRequest(GetEmployeeSchema, req);
  const { employeeId } = safeData.params;

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
    },
    select: {
      id: true,
      name: true,
      user: {
        select: {
          id: true,
          status: true,
        },
      },
      email: true,
      organizationId: true,
      projectMembers: {
        select: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!employee) {
    throw new NotFoundError("Employee");
  }

  // map to UserDTO
  const employeeDTO: EmployeeDTO = {
    id: employee.id,
    name: employee.name,
    user: employee.user,
    email: employee.email,
    organizationId: employee.organizationId,
    projects: employee.projectMembers.map((project) => ({
      id: project.project.id,
      name: project.project.name,
    })),
  };

  const parsed = EmployeeDTOSchema.safeParse(employeeDTO);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getEmployeeRoute };
