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
    // GoogleProvider({
    //   clientId: process.env.AUTH_GOOGLE_ID || '', // Provide default value
    //   clientSecret: process.env.AUTH_GOOGLE_SECRET || '', // Provide default value
    // }),
    FacebookProvider({
      clientId: process.env.AUTH_FACEBOOK_ID || '', // Provide default value
      clientSecret: process.env.AUTH_FACEBOOK_SECRET || '', // Provide default value
    }),
  ],
  callbacks: {
    async session({ token, session }: { token: JWT; session: Session }) {
      if (token) {
        session.user = session.user || {}; 
        session.user.id = token.id;
        session.user.role = token.role || 'USER'; // Ensure role is set
        session.user.isAdmin = token.role === "ADMIN";
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }

      // Fetch user from the database
      const userInDb = await prisma.user.findUnique({
        where: {
          email: token.email || '', // Provide default value
        },
        select: {
          id: true,  
          role: true, 
        },
      });

      // Handle user not found case
      if (userInDb) {
        token.role = userInDb.role;
        token.id = userInDb.id;  
      } else {
        token.role = "USER"; // Default role if not found
      }

      token.isAdmin = token.role === "ADMIN";

      return token;
    },
  },
};

export default NextAuth(authOptions);

export const getAuthSession = () => getServerSession(authOptions);
