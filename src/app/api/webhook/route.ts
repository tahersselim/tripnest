import prisma from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const success = body?.obj?.success;
    const paymentId = body?.obj?.id;
    const userId = body?.obj?.order?.items[0]?.description;
    const amount = body?.obj?.order?.items[0]?.amount_cents;
    const BookingId = body?.obj?.order?.merchant_order_id;
    const txnResponseCode = body?.obj?.data?.txn_response_code;
    
    console.log(parseInt(BookingId));
    
    

    if (success && txnResponseCode === "APPROVED") {
      await prisma.payment.create({
        data: {
          paymentId: paymentId, 
          amount: amount / 100,
          paymentMethod: "CREDIT_CARD", 
          paymentStatus: "PAID",
          bookingId: parseInt(BookingId),
          userId:userId 
        },
      });
    
      await prisma.booking.update({
        where: { id: parseInt(BookingId) },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",  
        },
      });
    
      console.log(`Payment successful for booking ${BookingId}. Payment number: ${paymentId}`);
    } else {
      await prisma.payment.create({
        data: {
          paymentId: paymentId, 
          amount: amount / 100,
          paymentMethod: "CREDIT_CARD", 
          paymentStatus: "UNPAID",
          bookingId: parseInt(BookingId),
          userId:userId 
        },
      });
    
      await prisma.booking.update({
        where: { id: parseInt(BookingId) },
        data: {
          status: "PENDING",
          paymentStatus: "UNPAID",  
        },
      });
      console.log(`Payment failed for order ${BookingId}`);
    }

    // Respond with a success message
    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Respond with an error message
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
