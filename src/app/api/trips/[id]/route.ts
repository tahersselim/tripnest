import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

// Get single trip
export const GET = async (
  req: NextRequest,
  { params }: { params: { id: number } }
) => {
  const { id } = params;

  try {
    const trip = await prisma.trip.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!trip) {
      return new NextResponse(JSON.stringify({ message: "Trip not found" }), {
        status: 404,
      });
    }

    return new NextResponse(JSON.stringify(trip), {
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching trip:", err);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const tripId = Number(id);

  if (isNaN(tripId)) {
    return new NextResponse(JSON.stringify({ message: "Invalid trip ID." }), {
      status: 400,
    });
  }

  const session = await getAuthSession();

  // Check if the user is authenticated and authorized
  if (!session?.user?.isAdmin) {
    return new NextResponse(
      JSON.stringify({
        message:
          "You are not authenticated or authorized to perform this action.",
      }),
      { status: 403 }
    );
  }

  try {
    const email = session.user.email;
    if (email) {
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

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        return new NextResponse(JSON.stringify({ message: "Trip not found." }), {
          status: 404,
        });
      }

      await prisma.trip.delete({
        where: { id: tripId },
      });

      return new NextResponse(
        JSON.stringify({ message: "Trip has been deleted successfully." }),
        { status: 200 }
      );
    } 
  } catch (error) { 
    console.error("Error deleting trip:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Something went wrong while deleting the trip.",
      }),
      { status: 500 }
    );
  } 
};
  
export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const session = await getAuthSession();

  // Check if the user is an admin
  if (!session?.user?.isAdmin) {
    return new NextResponse(
      JSON.stringify({ message: "Unauthorized access." }),
      { status: 403 }
    );
  }

  // Validate admin existence
  const email = session.user.email; // Extract email first

  if (!email) { // Check if email is null or undefined
    return new NextResponse(
      JSON.stringify({ message: "Unauthorized access." }),
      { status: 403 }
    );
  }

  const adminUser = await prisma.admin.findUnique({
    where: {
      email: email, // Use email safely here
    },
  });

  if (!adminUser) {
    return new NextResponse(
      JSON.stringify({ message: "Unauthorized access." }),
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      title,
      destination,
      description,
      price,
      duration,
      availableSeats,
      departureDate,
      returnDate,
      imageUrl,
    } = body;

    console.log(`Updating trip with ID: ${id}`);
    console.log(`Data to update:`, body);

    // Validate dates
    const currentDate = new Date();
    const depDate = new Date(departureDate);
    const retDate = new Date(returnDate);

    if (depDate < currentDate) {
      return new NextResponse(
        JSON.stringify({ message: "Departure date cannot be in the past." }),
        { status: 400 }
      );
    }

    if (retDate <= depDate) {
      return new NextResponse(
        JSON.stringify({
          message: "Return date must be after the departure date.",
        }),
        { status: 400 }
      );
    }

    // Update trip data
    const updatedTrip = await prisma.trip.update({
      where: { id: parseInt(id) },
      data: {
        title,
        destination,
        description,
        price,
        duration,
        availableSeats,
        departureDate,
        returnDate,
        imageUrl,
      },
    });

    return new NextResponse(
      JSON.stringify({ message: "Data updated successfully", updatedTrip }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error updating Trip:", err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong while updating data." }),
      { status: 500 }
    );
  }
};
