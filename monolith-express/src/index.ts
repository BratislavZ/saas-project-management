import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import { userRoutes } from "./features/employees/employee.routes";
import { organizationAdminRoutes } from "./features/organization-admins/organization-admin.routes";
import { organizationRoutes } from "./features/organizations/organization.routes";
import { permissionRoutes } from "./features/permissions/permission.routes";
import { projectMemberRoutes } from "./features/project-members/project-member.routes";
import { projectRoutes } from "./features/projects/project.routes";
import { roleRoutes } from "./features/roles/role.routes";
import { ticketRoutes } from "./features/tickets/ticket.routes";
import { utilsRoutes } from "./features/utils/utils.routes";
import { NotFoundError } from "./shared/errors/not-found-error";
import { logger } from "./shared/lib/logger";
import { prisma } from "./shared/lib/prisma";
import { errorHandler } from "./shared/middlewares/error-handler";

const app = express();

const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

if (!CLIENT_URL) {
  throw new Error("CLIENT_URL is not defined");
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    authorizedParties: [CLIENT_URL],
  })
);

// setupPinoHttp(app);

// Routes
app.use(organizationRoutes);
app.use(organizationAdminRoutes);
app.use(userRoutes);
app.use(projectRoutes);
app.use(projectMemberRoutes);
app.use(roleRoutes);
app.use(ticketRoutes);
app.use(permissionRoutes);
app.use(utilsRoutes);

// Catch all routes that do not exist
app.all("/{*splat}", () => {
  throw new NotFoundError("Route");
});

// Error handler middleware (must be defined last)
app.use(errorHandler);

const start = async () => {
  if (!PORT) {
    throw new Error("PORT is not defined");
  }
  if (!process.env.DB_USER) {
    throw new Error("DB_USER is not defined");
  }
  if (!process.env.DB_PASSWORD) {
    throw new Error("DB_PASSWORD is not defined");
  }
  if (!process.env.DB_NAME) {
    throw new Error("DB_NAME is not defined");
  }
  if (!process.env.DB_PORT) {
    throw new Error("DB_PORT is not defined");
  }
  if (!process.env.DB_HOST) {
    throw new Error("DB_HOST is not defined");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }
  if (!process.env.CLERK_PUBLISHABLE_KEY) {
    throw new Error("CLERK_PUBLISHABLE_KEY is not defined");
  }
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is not defined");
  }

  try {
    process.on("SIGINT", async () => {
      await prisma.$disconnect();
      logger.info("Disconnected from database");
      process.exit(0);
    });
  } catch (error) {
    logger.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }

  // Start server
  app.listen(PORT, () => {
    logger.info(`Server running on port: ${PORT}`);
  });
};

start();
