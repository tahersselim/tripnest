import Leadership from "@/components/Leadership";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const About = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center">About Us</h1>
        <div className="mt-10">
          <Image
            src="/about-us.jpg" 
            alt="About Us"
            width={800}
            height={400}
            className="object-cover w-full h-80 rounded-lg"
          />
        </div>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
          <p className="mt-4 text-gray-900">
            At TripNest, we are dedicated to providing exceptional travel experiences that create lasting memories. Our mission is to offer unique trips that cater to a variety of interests and preferences, ensuring that each journey is unforgettable.
          </p>
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800">Our Values</h2>
          <p className="mt-4 text-gray-700">
            We believe in integrity, excellence, and customer satisfaction. Our team is committed to upholding these values in every aspect of our service, from the planning stages to the final destination.
          </p>
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800">Meet the Team</h2>
          <p className="mt-4 text-gray-700">
            Our dedicated team of travel experts brings a wealth of experience and passion to every trip we offer. From our customer service representatives to our tour guides, we work tirelessly to ensure that your travel experience is seamless and enjoyable.
          </p>
          <Leadership/>
        </section>
        <div className="mt-12 text-center">
          <Link href="/" className="text-gray-600 hover:text-blue-800">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
