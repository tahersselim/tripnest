import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { getServerSession, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import prisma from "./connect"; 
import { JWT } from "next-auth/jwt";

type Role = 'USER' | 'ADMIN';

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string; 
      role: Role;
      isAdmin: boolean; 
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;  
    role: Role;
    isAdmin: boolean;
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const, 
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
    }),
  ],
  callbacks: {
    async session({ token, session }: { token: JWT; session: Session }) {
      if (token) {
        session.user = session.user || {}; 
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isAdmin = token.role === "ADMIN";
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }

      const userInDb = await prisma.user.findUnique({
        where: {
          email: token.email!,
        },
        select: {
          id: true,  
          role: true, 
        },
      });

      token.role = userInDb?.role || "USER";
      token.isAdmin = token.role === "ADMIN";
      token.id = userInDb?.id || token.id;  

      return token;
    },
  },
};

export default NextAuth(authOptions);

export const getAuthSession = () => getServerSession(authOptions);
