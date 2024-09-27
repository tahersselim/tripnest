import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// Fetch trip data
const getData = async (id: number) => {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/trips/${id}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch trip data!");
  }
  return res.json();
};
export const metadata = {
  title: "TripNest - Trips",
  description: "Plan your next trip effortlessly with TripNest.",
};
// Trip type definition
type Trip = {
  id: number;
  title: string;
  description: string;
  price: number;
  availableSeats: number;
  duration: string;
  destination: string;
  imageUrl: string;
};

type Props = {
  params: { id: number };
};

const Trips = async ({ params }: Props) => {
  const trip: Trip = await getData(params.id);

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Section */}
        <div className="md:w-1/2 lg:w-1/2 lg:pl-2">
          <div className="relative w-full h-96 md:h-[600px]"> {/* Use fixed height for larger screens */}
            <Image
              src={trip.imageUrl ? trip.imageUrl : "/trip.jpg"}
              alt={trip.title}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="md:w-1/2 lg:w-2/3 lg:pr-5">
          <h1 className="text-4xl font-bold mb-4">{trip.title}</h1>
          <p className="text-lg text-gray-600 mb-6">
            <strong>Price:</strong> EGP{trip.price} | <strong>Duration:</strong> {trip.duration} | <strong>Location:</strong> {trip.destination}
          </p>
          <p className="text-lg mb-6">{trip.description || "No description available for this trip."}</p>

          {/* Trip Information Summary */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Trip Information</h2>
            <ul className="space-y-4">
              <li>
                <strong>Available Seats:</strong> {trip.availableSeats}
              </li>
              <li>
                <strong>Price:</strong> EGP{trip.price}
              </li>
              <li>
                <strong>Duration:</strong> {trip.duration}
              </li>
              <li>
                <strong>Location:</strong> {trip.destination}
              </li>
            </ul>
          </div>

          {/* Booking Link */}
          <div className="mt-6">
            <Link
              href={`/book/${trip.id}`}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trips;
