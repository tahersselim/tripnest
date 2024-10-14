"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { booking } from '@/types/type';
import { toast } from 'react-toastify';
import Link from 'next/link';

const BookingPage: React.FC<{ params: { id: number } }> = ({ params }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [booking, setBooking] = useState<booking | null>(null);
    const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
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
                const res = await fetch(`/api/admin/${params.id}`, { cache: 'default'});
                if (!res.ok) {
                    throw new Error("Failed to fetch data!");
                }
                const data = await res.json();
                setBooking(data);
            } catch (error) {
                console.error(error);
                toast.error("Booking not found.");
                router.push("/adminDb")
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id, router, status]);


    const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setNumberOfGuests(value);
    };
    if (loading) {
        return <div>Loading...</div>;
    }
    if (!booking) {
        return <div>Loading...</div>;
    }
    const { id } = params

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/admin/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                const response = await res.json();
                console.log("Delete Response:", response);
                router.push("/adminDb");
            } else {
                const data = await res.json();
                console.log("Delete failed:", data);
                toast.error("Failed to delete booking.");
            }
        } catch (error) {
            console.error("Error occurred:", error);
            toast.error("An error occurred while trying to delete the product.");
        }
    };

    const handleUpdates = async (e: React.FormEvent<HTMLFormElement>, bookingId: number) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget);

        // Extract the updated form data
        const updatedData = {
            Address: String(formData.get('Address')),
            phone: String(formData.get('phone')),
            paymentStatus: (e.currentTarget.elements.namedItem('paymentStatus') as HTMLSelectElement).value,
            status: (e.currentTarget.elements.namedItem('status') as HTMLSelectElement).value,
            numberOfGuests: Number(formData.get('numberOfGuests')),
            totalPrice: Number(formData.get('price')),
        };



        const changes: Partial<typeof updatedData> = {};

        if (updatedData.Address !== booking.Address) {
            changes.Address = updatedData.Address;
        }
        if (updatedData.phone !== booking.phoneNumber) {
            changes.phone = updatedData.phone;
        }
        if (updatedData.paymentStatus !== booking.paymentStatus) {
            changes.paymentStatus = updatedData.paymentStatus;
        }
        if (updatedData.status !== booking.status) {
            changes.status = updatedData.status;
        }
        if (updatedData.numberOfGuests !== booking.numberOfSeats) {
            changes.numberOfGuests = updatedData.numberOfGuests;
        }
        if (updatedData.totalPrice !== booking.totalPrice) {
            changes.totalPrice = updatedData.totalPrice;
        }

        if (Object.keys(changes).length === 0) {
            toast.info('No changes detected.');
            return;
        }

        try {
            const res = await fetch(`/api/editbooking/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(changes),
            });
            if (!res.ok) {
                throw new Error('Failed to update booking');
            } if (res.ok) {
                window.location.reload();
                toast.success("Booking updated successfully!");
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            toast.error('Failed to update booking.');
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
                <h1 className="text-2xl font-bold mb-6">Booking Details (ID : {booking?.id})</h1>
            </header>
            <Link href="/adminDb" className=" text-blue-600 font-bold text-xl mr-4 hover:underline pl-2">
                Back to DB
            </Link>
            <section className="bg-white p-6 rounded-lg shadow-md">

                <form
                    onSubmit={(e) => handleUpdates(e, booking.id)}
                >
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-gray-700 mb-1">User Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={booking?.user.name ?? ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-400"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="Address" className="block text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    id="Address"
                                    name="Address"
                                    defaultValue={booking?.Address || 'No Address'}
                                    placeholder='Address'
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={booking?.user.email ?? ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-400"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    defaultValue={booking?.phoneNumber ?? 'No Phone Number'}
                                    placeholder='No Phone Number'
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="title" className="block text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={booking?.trip.title}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-400"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="title" className="block text-gray-700 mb-1">Booking Date</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={booking?.bookingDate ? formatDateTimeLocal(booking.bookingDate) : ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-400"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="paymentStatus" className="block text-gray-700 mb-1">Payment Status</label>
                                <select
                                    name="paymentStatus"
                                    id="paymentStatus"
                                    defaultValue={booking?.paymentStatus}
                                    className="border rounded p-1"
                                >
                                    <option value="PAID">PAID</option>
                                    <option value="UNPAID">UNPAID</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-gray-700 mb-1">Booking Status</label>
                                <select
                                    name="status"
                                    id="status"
                                    defaultValue={booking?.status}
                                    className="border rounded p-1"
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="CONFIRMED">CONFIRMED</option>
                                    <option value="CANCELED">CANCELED</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="numberOfGuests" className="block text-gray-700 mb-1">Number of Guests</label>
                                <input
                                    type="number"
                                    id="numberOfGuests"
                                    name="numberOfGuests"
                                    min="1"
                                    defaultValue={booking.numberOfSeats}
                                    // value={numberOfGuests}
                                    onChange={handleGuestChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-gray-700 mb-1">Total Price</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    defaultValue={booking?.totalPrice.toFixed(2)}
                                    placeholder={booking?.totalPrice.toFixed(2)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        <br />
                        {numberOfGuests > booking?.trip.availableSeats &&
                            <p className="text-red-700 ">Please Note that: there is only {booking?.trip.availableSeats} available seats.
                            </p>
                        }
                    </div>
                    <div className="mt-6">
                        <button type='submit' className="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-600">
                            Save Changes
                        </button>
                        <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                            Delete Booking
                        </button>

                    </div>
                    <p className='pt-3 text-red-600'>Please note that: if a payment is paid and you still want to remove the booking you will need to remove the payment related to the booking first</p>
                </form>

            </section>
        </main>
    );
}

export default BookingPage;
