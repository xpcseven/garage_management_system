import { type DefaultSession } from "next-auth";
import { UserRole } from "@/prisma/UserRole.enum";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  role: UserRole;
  email: string;
  name: string;
};

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
  }

  interface Session {
    user: ExtendedUser;
  }
}
