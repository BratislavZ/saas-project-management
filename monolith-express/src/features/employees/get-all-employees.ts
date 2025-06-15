import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { logger } from "../../shared/lib/logger";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";
import { EmployeeDTO, EmployeeDTOSchema } from "./utils/dtos";

const router = Router();

router.get(
  "/api/organization/:organizationId/employees",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  getAllEmployeesHandler
);

const GetAllEmployeesSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
  }),
  query: z.object({
    includeBanned: z.literal("true").optional(),
  }),
});

async function getAllEmployeesHandler(
  req: Request,
  res: Response<Array<Pick<EmployeeDTO, "id" | "name" | "user" | "email">>>
) {
  const safeData = await validateRequest(GetAllEmployeesSchema, req);
  const { organizationId } = safeData.params;

  const employees = await prisma.employee.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      user: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  const validationSchema = z.array(
    EmployeeDTOSchema.pick({ id: true, name: true, user: true, email: true })
  );
  const parsed = validationSchema.safeParse(employees);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getAllEmployeesRoute };
