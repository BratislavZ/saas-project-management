import { UserWithRelations } from "./users/UserWithRelations";

declare global {
  namespace Express {
    interface Request {
      currentUser: UserWithRelations;
    }
  }
}
