import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const session = await getAuthSession();

  // Check if the user is authenticated and has admin privileges
  if (session.user.isAdmin) {
    try {
      const body = await req.json();
      const { email } = body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        return new NextResponse(
          JSON.stringify({ message: "User with this email does not exist." }),
          { status: 404 }
        );
      }

      if (existingUser.role !== "ADMIN") {
        return new NextResponse(
          JSON.stringify({ message: "User is not an admin." }),
          { status: 403 }
        );
      }

      const admin = await prisma.admin.create({
        data: body,
      });

      console.log("Admin created successfully");
      return new NextResponse(JSON.stringify(admin), { status: 201 });
    } catch (error) {
      console.log(error);
      return new NextResponse(
        JSON.stringify({ message: "Something went wrong" }),
        { status: 500 }
      );
    }
  } else {
    return new NextResponse(
      JSON.stringify({ message: "You are not authenticated" }),
      { status: 401 }
    );
  }
};
