"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react";

const Mobilemenu = () => {
    const [dropdownMobileMenu, setMobileMenuOpen] = useState(false);
    const { data: session } = useSession();
    const handleMobileMenu = () => {
        setMobileMenuOpen(!dropdownMobileMenu);
    };
    return (
        <div>
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
                <button
                    onClick={handleMobileMenu}
                    className="text-gray-800 focus:outline-none hover:text-gray-600 p-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
                {dropdownMobileMenu && (
                    <div className="absolute right-0 top-12 w-48 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                            {session?.user.role === "ADMIN"?
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
            </div>
        </div>
    )
}
export default Mobilemenu



