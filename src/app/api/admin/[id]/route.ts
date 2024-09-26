import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

// PUT request to update user role
export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const session = await getAuthSession();

  if (!session?.user?.isAdmin) {
    return new NextResponse(
      JSON.stringify({ message: "Unauthorized access." }),
      { status: 403 }
    );
  }
if(session.user.isAdmin){
  try {
    const body = await req.json();
    console.log(body.newRole);

    await prisma.user.update({
      where: { id: id },
      data: { role: body.newRole },
    });

    return new NextResponse(JSON.stringify({ message: "Data updated successfully" }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error updating data:", err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong while updating data." }),
      { status: 500 }
    );
  }
}
};






// GET request to fetch booking by ID
export const GET = async (
  req: NextRequest,
  { params }: { params: { id: number } }
) => {
  const { id } = params;
  const session = await getAuthSession();

  if (!session?.user?.isAdmin) {
    return new NextResponse(
      JSON.stringify({ message: "Unauthorized access." }),
      { status: 403 }
    );
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        trip: true,
        user: true,
        phoneNumber: true,
        Address: true,
        bookingDate: true,
        paymentStatus: true,
        status: true,
        numberOfSeats: true,
        totalPrice: true,
        createdAt: true,
      },
    });

    if (!booking) {
      return new NextResponse(
        JSON.stringify({ message: "Booking not found." }),
        { status: 404 }
      );
    }

    return new NextResponse(JSON.stringify(booking), { status: 200 });
  } catch (err) {
    console.error("Error fetching booking:", err);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error." }),
      { status: 500 }
    );
  }
};

// DELETE request to delete booking by ID
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const session = await getAuthSession();

  if (!session?.user?.isAdmin) {
    return new NextResponse(
      JSON.stringify({
        message: "You are not authenticated or authorized to perform this action.",
      }),
      { status: 403 }
    );
  }

  const bookingId = Number(id);
  if (isNaN(bookingId)) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid booking ID." }),
      { status: 400 }
    );
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return new NextResponse(
        JSON.stringify({ message: "Booking not found." }),
        { status: 404 }
      );
    }

    await prisma.booking.delete({
      where: { id: bookingId },
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
