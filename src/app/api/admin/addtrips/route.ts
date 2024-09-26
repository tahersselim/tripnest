import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const session = await getAuthSession();

  if (session.user.isAdmin) {
    try {
      const body = await req.json();
      const email = session.user.email;
      const adminUser = await prisma.admin.findUnique({
        where: { email },
      });

      if (!adminUser) {
        return new NextResponse(
          JSON.stringify({ message: "User doesn't exist in the admin table." }),
          { status: 404 }
        );
      }

      if (adminUser.role !== "ADMIN") {
        return new NextResponse(
          JSON.stringify({ message: "User is not an admin." }),
          { status: 403 }
        );
      }

      const currentDate = new Date();
      const departureDate = new Date(body.departureDate);
      const returnDate = new Date(body.returnDate);

      if (departureDate < currentDate) {
        return new NextResponse(
          JSON.stringify({ message: "Departure date cannot be in the past." }),
          { status: 400 }
        );
      }

      if (returnDate <= departureDate) {
        return new NextResponse(
          JSON.stringify({ message: "Return date must be after the departure date." }),
          { status: 400 }
        );
      }

      const trip = await prisma.trip.create({
        data: {
          title: body.title,
          destination: body.destination,
          description: body.description,
          price: parseInt(body.price),
          duration: body.duration,
          availableSeats: parseInt(body.availableSeats),
          departureDate: body.departureDate,
          returnDate: body.returnDate,
          imageUrl: body.imageUrl,
          createdById: adminUser.id,
        },
      });

      console.log(`Trip created successfully with ID: ${trip.id}`);
      return new NextResponse(JSON.stringify({ tripId: trip.id }), { status: 201 });
    } catch (error) {
      console.error("Error creating trip:", error);
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
