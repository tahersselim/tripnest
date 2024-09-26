import Link from 'next/link';
import React from 'react';
import LoginButton from './LoginButton';
import Mobilemenu from './Mobilemenu';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="bg-white text-gray-700 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl font-bold">
         <Link href="/" className='flex'>
            <Image src="/LOGO.png" alt="logo" width={25} height={25}  />
            TripNest
          </Link>
        </div>
        <div>
          <Mobilemenu />
        </div>
        {/* Links for larger screens */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-[#2E4053]">Home</Link>
          <Link href="/About" className="hover:text-[#2E4053]">About</Link>
          <Link href="/Contact" className="hover:text-[#2E4053]">Contact</Link>
          <LoginButton />
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
