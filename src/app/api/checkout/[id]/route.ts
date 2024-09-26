import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const session = await getAuthSession();

  if (session) {
    try {
      const body = await req.json();
      const tripId = parseInt(body.tripId);

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: {
          departureDate: true,
          returnDate: true,
          cutOffTimeInMinutes: true,
        },
      });

      if (!trip) {
        return new NextResponse(
          JSON.stringify({ message: "Trip not found." }),
          { status: 404 }
        );
      }

      const currentDate = new Date();
      const depDate = new Date(trip.departureDate);
      const retDate = new Date(trip.returnDate);
      currentDate.setHours(currentDate.getHours() + 3);
      
      if (depDate < currentDate) {
        return new NextResponse(
          JSON.stringify({ message: "Departure date cannot be in the past." }),
          { status: 400 }
        );
      }

      if (retDate <= depDate) {
        return new NextResponse(
          JSON.stringify({ message: "Return date must be after the departure date." }),
          { status: 400 }
        );
      }

      const cutOffTimeInMinutes = trip.cutOffTimeInMinutes;
      const cutOffDate = new Date(depDate.getTime() - cutOffTimeInMinutes * 60000); 

      if (currentDate > cutOffDate) {
        return new NextResponse(
          JSON.stringify({ message: "Booking is closed for this trip." }),
          { status: 400 }
        );
      }

      const booking = await prisma.booking.create({
        data: {
          Address: body.address,
          phoneNumber: body.phoneNumber,
          tripId: tripId,
          userId: body.userId,
          numberOfSeats: body.numberOfSeats,
          totalPrice: body.totalPrice,
        },
      });

      console.log("Booking created successfully");
      return new NextResponse(JSON.stringify(booking), { status: 201 });
    } catch (error) {
      console.error("Error creating booking:", error);
      return new NextResponse(
        JSON.stringify({ message: "Something went wrong." }),
        { status: 500 }
      );
    }
  } else {
    return new NextResponse(
      JSON.stringify({ message: "You are not authenticated." }),
      { status: 401 }
    );
  }
};


////////////////////booking
export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  // Ensure the id is a valid number
  const bookingId = Number(id);
  if (isNaN(bookingId)) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid booking ID." }),
      { status: 400 }
    );
  }

  try {
    // Fetch the booking with related trip and user information
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        trip: {
          select: {
            title: true,
            destination: true,
            duration: true,
            departureDate: true,
            returnDate: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Handle case where no booking is found
    if (!booking) {
      return new NextResponse(
        JSON.stringify({ message: "Booking not found." }),
        { status: 404 }
      );
    }

    if (booking.paymentStatus === "PAID") {
      return new NextResponse(
        JSON.stringify({
          message:
            "This booking has already been paid. Please contact support for further assistance.",
        }),
        { status: 403 } // Forbidden access
      );
    }

    // If payment is not paid, return the booking details
    return new NextResponse(JSON.stringify(booking), {
      status: 200,
    });
  } catch (err) {
    // Log and handle any errors
    console.error("Error fetching booking:", err);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
};

////////////////delete booking
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  const session = await getAuthSession();
  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({
        message:
          "You are not authenticated or authorized to perform this action.",
      }),
      { status: 403 }
    );
  }

  // Ensure that the provided id is a valid number
  const bookingId = Number(id);
  if (isNaN(bookingId)) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid booking ID." }),
      { status: 400 }
    );
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return new NextResponse(
        JSON.stringify({ message: "Booking not found." }),
        { status: 404 }
      );
    }

    if (booking.paymentStatus === "PAID") {
      return new NextResponse(
        JSON.stringify({
          message:
            "This booking has already been paid. Please contact support for cancellation.",
        }),
        { status: 403 }
      );
    }

    await prisma.booking.delete({
      where: {
        id: bookingId,
      },
    });

    return new NextResponse(
      JSON.stringify({ message: "Booking has been deleted successfully." }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting booking:", err);
    return new NextResponse(
      JSON.stringify({
        message: "Something went wrong while deleting the booking.",
      }),
      { status: 500 }
    );
  }
};
