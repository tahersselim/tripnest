import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Trip {
  id: string;
  title: string;
  price: number;
  imageUrl?: string; 
}

const getData = async (): Promise<Trip[]> => {
  try {
    const res = await fetch("http://localhost:3000/api/trips", {
      cache: 'default',
    });
    if (!res.ok) {
      throw new Error("Failed to fetch trips");
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return []; 
  }
};

const Trips = async () => {
  const trips = await getData(); 

  return (
    <div>
      <div className="bg-white" id="trips">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-[5rem] font-bold text-gray-900 text-center pb-4">Our Trips</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {trips.length > 0 ? (
              trips.map((trip) => (
                <Link href={`/trip/${trip.id}`} className="group" key={trip.id}>
                  <div className="relative h-[50vh] w-full overflow-hidden rounded-lg bg-gray-200">
                    <Image
                      fill
                      src={trip.imageUrl ? trip.imageUrl : "/trip.jpg"}
                      alt="Trip Image"
                      className="object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                  <h3 className="mt-4 text-sm text-gray-700">{trip.title}</h3>
                  <p className="mt-1 text-lg font-medium text-gray-900">EGP{trip.price}</p>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-700">No trips available at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trips;
