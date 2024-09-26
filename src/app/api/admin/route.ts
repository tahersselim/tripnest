import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";


//   const session = await getAuthSession();
//   if (session) {
//     try {
//       const body = await req.json();
//       const tripId = parseInt(body.tripId);

//       const booking = await prisma.booking.create({
//         data: {
//           Address: body.address,
//           phoneNumber: body.phoneNumber,
//           tripId: tripId,
//           userId: body.userId,
//           numberOfSeats: body.numberOfSeats,
//           totalPrice: body.totalPrice,
//         },
//       });
//       console.log("booking created succefully");
//       return new NextResponse(JSON.stringify(booking), { status: 201 });
//     } catch (error) {
//       console.log(error);
//       return new NextResponse(
//         JSON.stringify({ message: "Something went wrong" }),
//         { status: 500 }
//       );
//     }
//   } else {
//     return new NextResponse(
//       JSON.stringify({ message: "You are not authenticated" }),
//       { status: 401 }
//     );
//   }
// };

////////////////////booking
export const GET = async () => {
  const session = await getAuthSession();

  if (session?.user?.isAdmin) {
    try {
      const bookings = await prisma.booking.findMany({
        select: {
          id: true,
          trip: true,
          user: true,
          phoneNumber: true,
          Address: true,
          bookingDate:true,
          paymentStatus:true,
          status: true,
          numberOfSeats: true,
          totalPrice: true,
          createdAt: true,
        },
      });
      const payments = await prisma.payment.findMany({
        select: {
          id: true,
          bookingId: true,
          user: true,
          paymentId: true,
          paymentMethod: true,
          amount: true,
          paymentStatus: true,
          paymentDate: true,
        },
      });
      const users = await prisma.user.findMany();
      const trips = await prisma.trip.findMany({
        select: {
          id: true,
          title: true,
          destination:true,
          description: true,
          price: true,
          duration: true,
          availableSeats: true,
          departureDate: true,
          returnDate: true,
          imageUrl: true,
          createdBy: true,
        },
      });
      const Admins = await prisma.admin.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          Trip: true,
        },
      });
   
      return new NextResponse(JSON.stringify({ bookings, payments, Admins,trips, users }), {
        status: 200,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      return new NextResponse(
        JSON.stringify({ message: "Error fetching data." }),
        { status: 500 }
      );
    }
  } else {
    return new NextResponse(
      JSON.stringify({ message: "Unauthorized access." }),
      { status: 403 }
    );
  }
};

////////////////delete booking
// export const DELETE = async (
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) => {
//   const { id } = params;

//   const session = await getAuthSession();
//   if (!session?.user) {
//     return new NextResponse(
//       JSON.stringify({
//         message:
//           "You are not authenticated or authorized to perform this action.",
//       }),
//       { status: 403 }
//     );
//   }

//   // Ensure that the provided id is a valid number
//   const bookingId = Number(id);
//   if (isNaN(bookingId)) {
//     return new NextResponse(
//       JSON.stringify({ message: "Invalid booking ID." }),
//       { status: 400 }
//     );
//   }

//   try {
//     const booking = await prisma.booking.findUnique({
//       where: {
//         id: bookingId,
//       },
//     });

//     if (!booking) {
//       return new NextResponse(
//         JSON.stringify({ message: "Booking not found." }),
//         { status: 404 }
//       );
//     }

//     if (booking.paymentStatus === "PAID") {
//       return new NextResponse(
//         JSON.stringify({
//           message:
//             "This booking has already been paid. Please contact support for cancellation.",
//         }),
//         { status: 403 }
//       );
//     }

//     await prisma.booking.delete({
//       where: {
//         id: bookingId,
//       },
//     });

//     return new NextResponse(
//       JSON.stringify({ message: "Booking has been deleted successfully." }),
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error("Error deleting booking:", err);
//     return new NextResponse(
//       JSON.stringify({
//         message: "Something went wrong while deleting the booking.",
//       }),
//       { status: 500 }
//     );
//   }
// };
