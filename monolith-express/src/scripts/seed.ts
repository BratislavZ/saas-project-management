import { Prisma } from "@prisma/client";
import { logger } from "../shared/lib/logger";
import { prisma } from "../shared/lib/prisma";

const PERMISSIONS_TO_SEED: Prisma.PermissionCreateManyInput[] = [
  // Project permissions
  {
    code: "PROJECT_UPDATE",
    group: "PROJECT",
    description: "Update project details",
  },
  {
    code: "PROJECT_ARCHIVE",
    group: "PROJECT",
    description: "Archive projects",
  },
  {
    code: "PROJECT_ACTIVATE",
    group: "PROJECT",
    description: "Activate projects",
  },
  {
    code: "PROJECT_DELETE",
    group: "PROJECT",
    description: "Delete projects",
  },

  // Project member permissions
  {
    code: "PROJECT_MEMBER_VIEW",
    group: "PROJECT_MEMBER",
    description: "View project members",
  },
  {
    code: "PROJECT_MEMBER_ADD",
    group: "PROJECT_MEMBER",
    description: "Add members to projects",
  },
  {
    code: "PROJECT_MEMBER_REMOVE",
    group: "PROJECT_MEMBER",
    description: "Remove members from projects",
  },
  {
    code: "PROJECT_MEMBER_ROLE_UPDATE",
    group: "PROJECT_MEMBER",
    description: "Update member roles in projects",
  },

  // Ticket permissions
  {
    code: "TICKET_CREATE",
    group: "TICKET",
    description: "Create new tickets",
  },
  {
    code: "TICKET_UPDATE",
    group: "TICKET",
    description: "Update ticket details",
  },
  {
    code: "TICKET_DELETE",
    group: "TICKET",
    description: "Delete tickets",
  },
  {
    code: "TICKET_REORDER",
    group: "TICKET",
    description: "Reorder tickets",
  },

  // Ticket column permissions
  {
    code: "TICKET_COLUMN_CREATE",
    group: "TICKET_COLUMN",
    description: "Create new ticket columns",
  },
  {
    code: "TICKET_COLUMN_UPDATE",
    group: "TICKET_COLUMN",
    description: "Update ticket columns",
  },
  {
    code: "TICKET_COLUMN_DELETE",
    group: "TICKET_COLUMN",
    description: "Delete ticket columns",
  },
  {
    code: "TICKET_COLUMN_REORDER",
    group: "TICKET_COLUMN",
    description: "Reorder ticket columns",
  },
];

async function seedPermissions() {
  logger.info("Starting permission seeding...");

  try {
    // Verify existing permissions
    const existingPermissions = await prisma.permission.findMany();
    const existingCodes = new Set(existingPermissions.map((p) => p.code));

    // Find missing permissions
    const missingPermissions = PERMISSIONS_TO_SEED.filter(
      (p) => !existingCodes.has(p.code)
    );

    if (missingPermissions.length === 0) {
      logger.info("All permissions already exist in database");
      return;
    }

    logger.info(`Found ${missingPermissions.length} permissions to seed`);

    // Create missing permissions
    const result = await prisma.permission.createMany({
      data: missingPermissions,
      skipDuplicates: true,
    });

    logger.info(`Successfully seeded ${result.count} permissions`);
  } catch (error) {
    logger.error("Error during permission seeding:", error);
    throw error;
  }
}

async function main() {
  try {
    await seedPermissions();
    logger.info("Seeding completed successfully");
  } catch (error) {
    logger.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
