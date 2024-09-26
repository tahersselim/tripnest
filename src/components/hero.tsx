import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Hero = () => {
  return (
    <div className="relative h-[100vh] w-full"> 
      {/* Background Image */}
      <Image
        src="/trip.jpg"
        alt="trip"
        fill
        className="object-cover" 
        priority 
      />

      {/* Overlay content */}
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold">Explore the World with TripNest</h1>
        <p className="mt-4 text-lg md:text-xl">Find your next adventure with our curated trips</p>

        {/* Call to action button */}
        <Link href="#trips" className="mt-6 bg-[#5DADE2] hover:bg-[#2E4053] text-white py-3 px-6 rounded-lg shadow-lg">
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default Hero;
