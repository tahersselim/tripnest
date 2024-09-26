import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

interface UserResponse {
  id: string;
  name?: string;
  email?: string | null;
  image?: string | null;
}

export const GET = async () => {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return new NextResponse(
      JSON.stringify({ message: "You are not authenticated or authorized to perform this action." }),
      { status: 403 }
    );
  }

  const email = session.user.email;

  if (session.user.isAdmin) {
    try {
      const adminUser = await prisma.admin.findUnique({
        where: { email },
      });

      if (!adminUser) {
        return new NextResponse(
          JSON.stringify({ message: "Admin not found" }),
          { status: 404 }
        );
      }

      const users = await prisma.user.findMany({
        where: {
          role: "USER",
          email: {
            not: session.user.email,
          }
        }
      });

      const usersResponse = users.map((user) => ({
        id: user.id,
        Role: user.role,
        name: user.name || undefined,
        email: user.email || null,
        image: user.image || null,
      }));

      return new NextResponse(
        JSON.stringify({ adminUser, users: usersResponse }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching admin or users:", error);
      return new NextResponse(
        JSON.stringify({ message: "Something went wrong while fetching admin or users." }),
        { status: 500 }
      );
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User not found" }),
        { status: 404 }
      );
    }

    // Return the single user's details
    const userResponse: UserResponse = {
      id: user.id,
      name: user.name || undefined,
      email: user.email || null,
      image: user.image || null,
    };

    return new NextResponse(JSON.stringify(userResponse), { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong while fetching the user." }),
      { status: 500 }
    );
  }
};
