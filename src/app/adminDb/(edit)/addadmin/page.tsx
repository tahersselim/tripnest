"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';

const BookingPage: React.FC = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false); // Initial loading is set to false

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        } else if (status === "authenticated" && !session?.user?.isAdmin) {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    useEffect(() => {
        const fetchData = async () => {
            if (status === "loading") return;
            if (status === "unauthenticated") {
                router.push("/login");
                return;
            }
        };

        fetchData();
    }, [status, router]);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when the request starts
        const formData = new FormData(e.currentTarget);
        const addedData = {
            name: String(formData.get('AdminName')),
            email: String(formData.get('AdminEmail')),
        };

        try {
            const res = await fetch(`/api/admin/addadmin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addedData),
            });

            if (!res.ok) {
                throw new Error('Failed to add Admin');
            }
            toast.success("Admin added successfully!");
            router.push("/adminDb")
        } catch (error) {
            console.error('Error adding admin:', error);
            toast.error('Failed to add admin.');
        } finally {
            setLoading(false); 
        }
    };

    return (
        <main className="flex-1 p-6">
            <Link href="/adminDb" className="text-blue-600 font-bold text-xl mr-4 hover:underline pl-2">
                Back to DB
            </Link>
            <section className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleAdd}>
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="AdminName" className="block text-gray-700 mb-1">Admin Name</label>
                                <input
                                    type="text"
                                    id="AdminName"
                                    name="AdminName"
                                    placeholder="Your name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="AdminEmail" className="block text-gray-700 mb-1">Admin Email</label>
                                <input
                                    type="email"
                                    id="AdminEmail"
                                    name="AdminEmail"
                                    placeholder="Email@example.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-600"
                                    disabled={loading}
                                >
                                    {loading ? "Adding..." : "Add Admin"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default BookingPage;
