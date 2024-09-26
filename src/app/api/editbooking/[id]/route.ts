import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

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

  try {
    const body = await req.json();
    const {
      Address,
      phone,
      paymentStatus,
      status,
      numberOfGuests,
      totalPrice,
    } = body;

    console.log(`Updating booking with ID: ${id}`);
    console.log(`Data to update:`, body);

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        Address: Address,
        phoneNumber: phone,
        paymentStatus,
        status,
        numberOfSeats: numberOfGuests,
        totalPrice,
      },
    });

    return new NextResponse(
      JSON.stringify({ message: "Data updated successfully", updatedBooking }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error updating booking:", err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong while updating data." }),
      { status: 500 }
    );
  }
};
