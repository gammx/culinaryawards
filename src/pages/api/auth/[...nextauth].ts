import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    }
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  events: {
    async createUser({ user }) {
      await prisma.logs.create({
        data: {
          type: "REGISTER",
          invokerId: user.id,
        }
      });
    },
  },
  providers: [
    EmailProvider({
      server: {
        service: env.EMAIL_SERVICE,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD,
        }
      },
      from: env.EMAIL_FROM,

    })
  ],
};

export default NextAuth(authOptions);
