"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { User, Trip } from '@/types/type';
import { toast } from 'react-toastify';

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

const BookingPage: React.FC<{ params: { id: number } }> = ({ params }) => {
    const { data: session, status } = useSession();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [Address, setAddress] = useState<string | null>(null);
    const [phone, setPhone] = useState<string | null>(null);
    const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await getData();
            if (userData) {
                setUser(userData);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (status === "loading") return;

            if (status === "unauthenticated") {
                router.push("/login");
                return;
            }

            try {
                const res = await fetch(`/api/trips/${params.id}`, { cache: "no-store" });
                if (!res.ok) {
                    throw new Error("Failed to fetch trip data!");
                }
                const tripData = await res.json();
                setTrip(tripData);
            } catch (error) {
                console.error(error);
                router.push("/404");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id, router, status]);

    const addHoursToDate = (date: Date, hours: number) => {
        date.setHours(date.getHours() - hours);
        return date;
    };


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        
        if (!trip) {
            toast.error("Trip data is not available.");
            setLoading(false);
            return;
        }
        
        const departureDate = addHoursToDate(new Date(trip.departureDate), 3);
        console.log(departureDate);
        
        const cutOffTimeInMinutes = trip.cutOffTimeInMinutes || 1;
        const cutOffDate = new Date(departureDate.getTime() - cutOffTimeInMinutes * 60000);
        const currentDate = new Date();
    
        if (currentDate > cutOffDate) {
            toast.error("Booking is closed for this trip.");
            setLoading(false);
            return;
        }
    
        const dat = {
            address: Address || "",
            phoneNumber: phone || "",
            totalPrice: totalPrice,
            numberOfSeats: numberOfGuests,
            userId: user?.id || session?.user.id,
            tripId: params.id,
        };
    
        try {
            const response = await fetch(`/api/checkout/${params.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dat),
            });
    
            if (response.ok) {
                const data = await response.json();
                toast.success("Booking created successfully");
                router.push(`/checkout/${data.id}`);
                return data;
            } else {
                const data = await response.json();
                console.error("Failed to create booking:", data.message);
                toast.error("Failed to create your booking.");
            }
        } catch (error) {
            console.error("Error during booking:", error);
            toast.error("Failed to create your booking.");
            router.push("/404");
        } finally {
            setLoading(false);
        }
    };
    

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!trip) {
        return <p>No trip found</p>;
    }
 
    
    const departureDate = trip.departureDate.toString();
    const returnDate = trip.returnDate.toString();
    const totalPrice = trip.price * numberOfGuests;

    const handleAddress = (e: React.ChangeEvent<HTMLInputElement>)=>{
        setAddress(e.target.value)
    }
    const handlephone = (e: React.ChangeEvent<HTMLInputElement>)=>{
        setPhone(e.target.value)
    }

    const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setNumberOfGuests(value <= trip.availableSeats ? value : trip.availableSeats);
    };
    return (
        <main className="flex-1 p-6">
            <header className="mb-6">
                <h2 className="text-3xl font-semibold text-gray-700">Book Your Trip</h2>
            </header>

            <section className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Booking Form</h3>
                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Personal Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-gray-700 mb-1">User Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={session?.user.isAdmin ? session.user.name ?? "" : user?.name ?? ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="Address" className="block text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    id="Address"
                                    name="Address"
                                    value={Address ?? ""}
                                    onChange={handleAddress}
                                    placeholder="Your Address"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={session?.user.isAdmin ? session.user.email ?? "" : user?.email ?? ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={phone ?? ""}
                                    onChange={handlephone}
                                    placeholder="+1 234 567 8900"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Trip Details */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Trip Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="title" className="block text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={trip.title}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="destination" className="block text-gray-700 mb-1">Destination</label>
                                <input
                                    type="text"
                                    id="destination"
                                    name="destination"
                                    value={trip.destination}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-gray-700 mb-1">Price</label>
                                <input
                                    type="text"
                                    id="price"
                                    name="price"
                                    value={trip.price.toFixed(2)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="duration" className="block text-gray-700 mb-1">Duration</label>
                                <input
                                    type="text"
                                    id="duration"
                                    name="duration"
                                    value={trip.duration}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="departureDate" className="block text-gray-700 mb-1">Departure Date</label>
                                <input
                                    type="text"
                                    id="departureDate"
                                    name="departureDate"
                                    value={departureDate.slice(0, 10) + " At " + departureDate.slice(11, 16)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="returnDate" className="block text-gray-700 mb-1">Return Date</label>
                                <input
                                    type="text"
                                    id="returnDate"
                                    name="returnDate"
                                    value={returnDate.slice(0, 10) + " At " + returnDate.slice(11, 16)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="numberOfGuests" className="block text-gray-700 mb-1">Number of Guests</label>
                                <input
                                    type="number"
                                    id="numberOfGuests"
                                    name="numberOfGuests"
                                    placeholder="1"
                                    min="1"
                                    max={trip.availableSeats}
                                    value={numberOfGuests}
                                    onChange={handleGuestChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <br />
                            {numberOfGuests == trip.availableSeats &&
                                <div className="text-red-700">Sorry, there is only {trip.availableSeats} available seats.</div>
                            }
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-700">
                            Please review your trip details before proceeding to checkout.
                        </p>
                        <div className="flex flex-col items-end">
                            <p className="text-gray-700 mb-2">Total Price:</p>
                            <p className="text-2xl font-semibold text-gray-900">EGP{numberOfGuests < trip.availableSeats ? totalPrice.toFixed(2) : trip.availableSeats * trip.price}</p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                            disabled={loading}
                       >
                            {loading ? "Proceding..." : "Proceed To Checkout"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default BookingPage;
