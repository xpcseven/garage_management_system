import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { UserRole } from "@/prisma/UserRole.enum";
import { getUserAuthById } from "./lib/action/user.action";

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      if (token.email && session.user) {
        session.user.email = token.email as string;
      }
      if (token.name && session.user) {
        session.user.name = token.name as string;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserAuthById(token.sub);

      if (!existingUser) return token;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;

      return token;
    },
  },
  session: { strategy: "jwt" },
  ...authConfig,
});
