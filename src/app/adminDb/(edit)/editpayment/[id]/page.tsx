"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { payment } from '@/types/type';
import { toast } from 'react-toastify';
import Link from 'next/link';

const BookingPage: React.FC<{ params: { id: number } }> = ({ params }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [payment, setpayment] = useState<payment | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

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
            try {
                const res = await fetch(`/api/admin/payment/${params.id}`, { cache: 'default' });
                if (!res.ok) {
                    throw new Error("Failed to fetch data!");
                }
                const data = await res.json();
                console.log(data);
                
                setpayment(data);
            } catch (error) {
                console.error(error);
                toast.error("Payment not found.");
                router.push("/adminDb");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id, router, status]);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!payment) {
        return <div>No payment details found.</div>;
    }

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/admin/payment/${params.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                const response = await res.json();
                console.log("Delete Response:", response);
                toast.success("Payment deleted succefully.");
                router.push("/adminDb");
            } else {
                const data = await res.json();
                console.log("Delete failed:", data);
                toast.error("Failed to delete Payment.");
            }
        } catch (error) {
            console.error("Error occurred:", error);
            toast.error("An error occurred while trying to delete the payment.");
        }
    };

    const handleUpdates = async (e: React.FormEvent<HTMLFormElement>, bookingId: number) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const updatedData = {
            paymentStatus: (e.currentTarget.elements.namedItem('paymentStatus') as HTMLSelectElement).value,
            paymentMethod: (e.currentTarget.elements.namedItem('paymentMethod') as HTMLSelectElement).value,
            price: Number(formData.get('amount')),
        };

        const changes: Partial<typeof updatedData> = {};

        if (updatedData.paymentStatus !== payment.paymentStatus) {
            changes.paymentStatus = updatedData.paymentStatus;
        }
        
        if (updatedData.paymentMethod !== payment.paymentMethod) {
            changes.paymentMethod = updatedData.paymentMethod;
        }
        
        if (updatedData.price !== payment.amount) {
            changes.price = updatedData.price;
        }

        if (Object.keys(changes).length === 0) {
            toast.info('No changes detected.');
            return;
        }

        try {
            const res = await fetch(`/api/admin/payment/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(changes),
            });
            if (!res.ok) {
                throw new Error('Failed to update booking');
            }
            toast.success("Payment updated successfully!");
            window.location.reload();
        } catch (error) {
            console.error('Error updating Payment:', error);
            toast.error('Failed to update Payment.');
        }
    };
    const formatDateTimeLocal = (dateString: string) => {
        const date = new Date(dateString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    return (
        <main className="flex-1 p-6">
            <header className="mb-6">
                <h1 className="text-2xl font-bold mb-6">Payment Details (ID: {payment?.id})</h1>
            </header>
            <Link href="/adminDb" className="text-blue-600 font-bold text-xl mr-4 hover:underline pl-2">
                Back to DB
            </Link>
            <section className={` ${payment.paymentStatus === "UNPAID" ? "bg-red-300 p-6 rounded-lg shadow-md" : "bg-white p-6 rounded-lg shadow-md"}`}>
                <form onSubmit={(e) => handleUpdates(e, payment.id)}>
                    <div className="mb-6">
                        {/* Using flexbox to organize fields */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[250px]">
                                <label htmlFor="paymentId" className="block text-gray-700 mb-1">Payment ID</label>
                                <input
                                    type="number"
                                    id="paymentId"
                                    name="paymentID"
                                    value={payment?.paymentId ?? ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-400"
                                    readOnly
                                />
                            </div>
                            <div className="flex-1 min-w-[250px]">
                                <label htmlFor="bookingId" className="block text-gray-700 mb-1">Booking ID</label>
                                <input
                                    type="number"
                                    id="bookingId"
                                    name="bookingId"
                                    value={payment?.bookingId || ''}
                                    placeholder='1234'
                                    className="w-full px-4 py-2 border border-gray-300 text-gray-400 rounded-md"
                                    readOnly
                                />
                            </div>
                            <div className="flex-1 min-w-[250px]">
                                <label htmlFor="amount" className="block text-gray-700 mb-1">User Name</label>
                                <input
                                    type="text"
                                    id="text"
                                    name="text"
                                    value={payment.user.name ?? ''}
                                    placeholder='John'
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-400"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[250px]">
                                <label htmlFor="paymentDate" className="block text-gray-700 mb-1">Payment Time</label>
                                <input
                                    type="text"
                                    id="paymentDate"
                                    name="paymentDate"
                                    value={payment?.paymentDate ? formatDateTimeLocal(payment.paymentDate) : ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-400"
                                    readOnly
                                />
                            </div>
                            <div className="flex-1 min-w-[250px]">
                                <label htmlFor="amount" className="block text-gray-700 mb-1">Payment Amount</label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    defaultValue={payment.booking.totalPrice ?? 'No amount'}
                                    placeholder='123 EGP'
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4">
                            <div className="flex-1 min-w-[250px]">
                                <label htmlFor="paymentStatus" className="block text-gray-700 mb-1">Payment Status</label>
                                <select
                                    name="paymentStatus"
                                    id="paymentStatus"
                                    defaultValue={payment?.paymentStatus}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="PAID">PAID</option>
                                    <option value="UNPAID">UNPAID</option>
                                </select>
                            </div>
                            <div className="flex-1 min-w-[250px]">
                                <label htmlFor="paymentMethod" className="block text-gray-700 mb-1">Payment Method</label>
                                <select
                                    name="paymentMethod"
                                    id="paymentMethod"
                                    defaultValue={payment?.paymentMethod}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="CREDIT_CARD">CREDIT_CARD</option>
                                    <option value="PAYPAL">PAYPAL</option>
                                    <option value="OTHER">OTHER</option>
                                </select>
                            </div>
                        </div>
                    </div>
    
                    <div className="mt-6 flex gap-4 flex-wrap">
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Save Changes
                        </button>
                        <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                            Delete Payment
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
    
}

export default BookingPage;
