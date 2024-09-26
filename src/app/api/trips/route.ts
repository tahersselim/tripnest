import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

// fetching my trip
export const GET = async () => {
  try {
    const trips = await prisma.trip.findMany();
    return new NextResponse(JSON.stringify(trips), { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse(
      JSON.stringify({ message: "something went wring" }),
      { status: 500 }
    );
  }
};
