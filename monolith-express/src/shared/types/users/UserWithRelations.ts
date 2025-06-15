import { Prisma } from "@prisma/client";

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    superAdmin: true;
    organizationAdmin: {
      include: {
        organization: true;
      };
    };
    employee: {
      include: {
        organization: true;
      };
    };
  };
}>;
