"use client";
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  name?: string;
  email?: string | null;
  image?: string | null;
}

const getData = async (): Promise<User | null> => {
  try {
    const res = await fetch("http://localhost:3000/api/user", {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch user data");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const LoginButton: React.FC = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getData();
      if (userData) {
        setUser(userData);
      }
    };

    fetchUserData();
  }, []);

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
    setTimeoutId(id);
  };

  return (
    <div
      className="relative inline-block text-left"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {status === "unauthenticated" ? (
        <Link href="/login" className="hover:text-[#2E4053]">Login</Link>
      ) : (
        <>
          <button
            onClick={handleDropdownToggle}
            className="flex items-center space-x-2 hover:text-[#2E4053] focus:outline-none"
          >
            {
              session?.user.role === "ADMIN" ?
                <Image
                  src={session.user.image || "/user.png"}
                  height={30}
                  width={30}
                  alt='user'
                  className='rounded-full object-cover'
                />
                :
                <Image
                  src={user?.image || "/user.png"}
                  height={30}
                  width={30}
                  alt='user'
                  className='rounded-full object-cover'
                />
            }

            <span>{session?.user.name || "User"}</span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                {session?.user.role === "ADMIN" ?
                  <Link href="/adminDb" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dash Board</Link>
                  :
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dash Board</Link>

                }
                <button
                  onClick={() => signOut()}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LoginButton;
