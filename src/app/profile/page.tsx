"use client";
import { User } from '@/types/type';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const getData = async (): Promise<User | null> => {
    try {
        const res = await fetch("/api/user", {
            cache: "no-store",
        });
        if (!res.ok) {
            throw new Error("Failed to fetch user data");
        }
        return await res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

const Profile = () => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, session, router]);

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await getData();
            if (userData) {
                setUser(userData);
            } else {
                router.push("/404");
            }
        };

        if (status === "authenticated") {
            fetchUserData();
        }
    }, [router, status]);

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    return (
        <main className="flex-1 p-6  min-h-screen">
            {/* Header Section */}
            <header className="mb-6">
                <h2 className="text-3xl font-semibold ">
                    Welcome, {session?.user.isAdmin ? session.user.name : user?.name || "User"}!
                </h2>
            </header>

            {/* User Information */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
                <div className="flex items-center">
                    <Image
                        src={session?.user.isAdmin ? session.user.image ?? "/default-profile.png" : user?.image ?? "/default-profile.png"}
                        alt="Profile"
                        width={100}
                        height={100}
                        className="rounded-full "
                    />
                    <div className="ml-6">
                        <p className="text-gray-700 text-lg font-medium">Name: {session?.user.isAdmin ? session.user.name : user?.name || "User"}</p>
                        <p className="text-gray-700 text-lg font-medium">Email: {session?.user.isAdmin ? session.user.email : user?.email || "Email@example.com"}</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut()}
                    className="bg-red-500 text-white mt-4 px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                    Sign out
                </button>
            </section>
        </main>
    );
};

export default Profile;
