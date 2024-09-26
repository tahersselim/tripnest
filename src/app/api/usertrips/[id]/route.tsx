import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";


export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  const session = await getAuthSession();
  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ message: "You are not authenticated or authorized to perform this action." }),
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
        JSON.stringify({ message: "This booking has already been paid. Please contact support for cancellation." }),
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
      JSON.stringify({ message: "Something went wrong while deleting the booking." }),
      { status: 500 }
    );
  }
};