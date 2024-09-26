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
      paymentStatus,
      paymentMethod,
      price,
    } = body;

    console.log(`Updating payment with ID: ${id}`);
    console.log(`Data to update:`, body);

    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        paymentStatus,
        paymentMethod,
        amount:price,
      },
    });

    return new NextResponse(
      JSON.stringify({ message: "Data updated successfully", updatedPayment }),
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
      const booking = await prisma.payment.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          paymentId:true,
          booking:true,
          bookingId:true,
          user:true,
          paymentMethod: true,
          paymentDate: true,
          amount: true,
          paymentStatus: true,
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
  
    const paymentId = Number(id);
    if (isNaN(paymentId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid payment ID." }),
        { status: 400 }
      );
    }
  
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });
  
      if (!payment) {
        return new NextResponse(
          JSON.stringify({ message: "Payment not found." }),
          { status: 404 }
        );
      }
  
      await prisma.payment.delete({
        where: { id: paymentId },
      });
  
      return new NextResponse(
        JSON.stringify({ message: "payment has been deleted successfully." }),
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