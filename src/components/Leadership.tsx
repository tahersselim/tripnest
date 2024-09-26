import Image from "next/image";
import React from "react";

const Leadership = () => {
  return (
    <div className="bg-white py-24 sm:py-32 flex flex-col items-center">
      <div className="max-w-7xl w-full px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Meet our leadership
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            At TripNest, our leadership team is the driving force behind our
            commitment to delivering unparalleled travel experiences. Each
            member of our leadership team plays a crucial role in guiding our
            company with passion, expertise, and a shared vision for excellence.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          <div className="flex items-center gap-x-6 pl-12">
            <Image
              src="/taher.jpg"
              alt="Taher Hassan"
              width={64} // Fixed width for a circular shape
              height={64} // Fixed height for a circular shape
              className="rounded-full object-cover"
            />
            <div>
              <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">
                Taher Hassan
              </h3>
              <p className="text-sm font-semibold leading-6 text-indigo-600">
                Co-Founder / CEO
              </p>
            </div>
          </div>
          <div className="flex items-center gap-x-6 pl-10">
            <Image
              src="/mohamed.jpg"
              alt="Mohamed Hassan"
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
            <div>
              <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">
                Mohamed Hassan
              </h3>
              <p className="text-sm font-semibold leading-6 text-indigo-600">
              Co-Founder
              </p>
            </div>
          </div>
          {/* Add more team members here if needed */}
        </div>
      </div>
    </div>
  );
};

export default Leadership;
