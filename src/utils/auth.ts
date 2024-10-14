import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { getServerSession, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import prisma from "./connect"; // Adjust this import if needed
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
    email?: string;
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
      clientId: process.env.AUTH_GOOGLE_ID || '', // Provide default value
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '', // Provide default value
    }),
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
        session.user.role = token.role || 'USER'; // Default role if not set
        session.user.isAdmin = token.role === "ADMIN";
      }

      return session;
    },

    async jwt({ token, user }: { token: JWT; user?: User }) {
      // If it's the first sign-in, the user object is populated
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined; // Handle null and undefined
      }

      try {
        // Fetch user from the database using the email in the token, handle null or undefined
        const userInDb = await prisma.user.findUnique({
          where: {
            email: token.email ?? undefined, // Ensure email is either string or undefined
          },
          select: {
            id: true,
            role: true,
          },
        });

        // If the user is found in the database, update the token with the role and id
        if (userInDb) {
          token.role = userInDb.role;
          token.id = userInDb.id;
        } else {
          token.role = "USER"; // Default role if user not found in the database
        }

        token.isAdmin = token.role === "ADMIN";
      } catch (error) {
        console.error("Error fetching user from the database: ", error);
        token.role = "USER"; // Default role in case of error
        token.isAdmin = false; 
      }

      return token;
    },
  },
};

export default NextAuth(authOptions);

// Optional helper function to get the session server-side
export const getAuthSession = () => getServerSession(authOptions);
