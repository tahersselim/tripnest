import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return new NextResponse(
      JSON.stringify({ message: "You are not authenticated or authorized to perform this action." }),
      { status: 403 }
    );
  }

  const userId = session.user.id;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: String(userId),
      },
      include: {
        trip: true, 
        payments: true,  
      },
    });

    if (bookings.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: 'No bookings found for this user' }),
        { status: 404 }
      );
    }

    const userTrips = bookings.map(booking => ({
      trip: booking.trip,
      payments: booking.payments,
      bookingId: booking.id, 
      bookingDate: booking.bookingDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
      numberOfSeats: booking.numberOfSeats,
      paymentStatus: booking.paymentStatus,
    }));

    return new NextResponse(JSON.stringify(userTrips), { status: 200 });
  } catch (error) {
    console.error("Error fetching user bookings and payments:", error);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong" }),
      { status: 500 }
    );
  }
};
