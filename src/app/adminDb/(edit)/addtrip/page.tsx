"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';

const BookingPage: React.FC = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [file, setFile] = useState<File>();
    const [loading, setLoading] = useState<boolean>(false); 

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


    const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const file = (target.files as FileList)[0];
        setFile(file);
    };

    const uploadImage = async () => {
        const data = new FormData();
        data.append("file", file!);
        data.append("upload_preset", "restaurant");

        const res = await fetch("https://api.cloudinary.com/v1_1/dcxspln3s/image/upload", {
            method: "POST",
            body: data,
        });

        const resData = await res.json();
        return resData.url;
    };
    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formElement = e.currentTarget as HTMLFormElement;
        const formData = new FormData(formElement);
        const url = file ? await uploadImage() : null;

        ///////////// Add 3 hours to handle the time difference 
        const addHoursToDate = (date: Date, hours: number) => {
            date.setHours(date.getHours() + hours);
            return date;
        };

        const departureDateInput = formData.get('departureDate') as string;
        const returnDateInput = formData.get('returnDate') as string;
        const currentDate = new Date(); 

        const departureDate = addHoursToDate(new Date(departureDateInput), 3);
        const returnDate = addHoursToDate(new Date(returnDateInput), 3);

        if (departureDate < currentDate) {
            toast.error("Departure date cannot be in the past.");
            setLoading(false);
            return; 
        }

        if (returnDate <= departureDate) {
            toast.error("Return date must be after the departure date.");
            setLoading(false);
            return; 
        }
        

        const addedData = {
            title: String(formData.get('tripTitle')),
            destination: String(formData.get('tripDestination')),
            description: String(formData.get('tripDescription')),
            price: parseInt(formData.get('paxPrice') as string, 10),
            duration: String(formData.get('tripDuration')),
            availableSeats: parseInt(formData.get('availableSeats') as string, 10),
            departureDate: departureDate.toISOString(),
            returnDate: returnDate.toISOString(),
            cutOffTimeInMinutes: parseInt(formData.get('cutoff') as string, 10),
            imageUrl: url,
        };

        try {
            const res = await fetch(`/api/admin/addtrips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addedData),
            });

            if (!res.ok) {
                throw new Error('Failed to add Trip');
            }
            if (res.ok) {
                toast.success("Trip added successfully!");
                const data = await res.json();
                const tripId = data.tripId;
                router.push(`/trip/${tripId}`);
            }
        } catch (error) {
            console.error('Error adding trip:', error);
            toast.error('Failed to add trip.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="flex-1 p-6 ">

            <Link href="/adminDb" className="text-blue-600 font-bold text-xl mr-4 hover:underline pl-2">
                Back to DB
            </Link>
            <section className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleAdd}>
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="TripTitle" className="block text-gray-700 mb-1">Trip Title</label>
                                <input
                                    type="text"
                                    id="tripTitle"
                                    name="tripTitle"
                                    placeholder="Trip Title"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="TripDestinatio" className="block text-gray-700 mb-1">Trip Destination</label>
                                <input
                                    type="text"
                                    id="tripDestination"
                                    name="tripDestination"
                                    placeholder="destination"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="TripDescription" className="block text-gray-700 mb-1">Trip Description</label>
                                <textarea
                                    id="tripDescription"
                                    name="tripDescription"
                                    placeholder="Description"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="PaxPrice" className="block text-gray-700 mb-1"> Pax Price</label>
                                <input
                                    type="number"
                                    min={1}
                                    id="paxPrice"
                                    name="paxPrice"
                                    placeholder="price"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="TripDuration" className="block text-gray-700 mb-1"> Trip Duration</label>
                                <input
                                    type="text"
                                    id="tripDuration"
                                    name="tripDuration"
                                    placeholder="1 day"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="AvailableSeats" className="block text-gray-700 mb-1">Available Seats</label>
                                <input
                                    type="number"
                                    min={1}
                                    id="availableSeats"
                                    name="availableSeats"
                                    placeholder="Minimum 1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="DepartureDate" className="block text-gray-700 mb-1">Departure Date</label>
                                <input
                                    type="datetime-local" id="departureDate" name="departureDate"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="CutOff" className="block text-gray-700 mb-1">Cutoff-Time In Minutes</label>
                                <input
                                    type="number" id="cutoff" name="cutoff"
                                    placeholder='60'
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="returnDate" className="block text-gray-700 mb-1">Return Date</label>
                                <input
                                    type="datetime-local" id="returnDate" name="returnDate"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="Image" className="block text-gray-700 mb-1">Image</label>
                                <input
                                    type='file'
                                    id="image"
                                    name="image"
                                    onChange={handleChangeImage}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>

                        </div>
                        <div className="mt-6">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-600"
                                disabled={loading}
                            >
                                {loading ? "Creatinging..." : "Create Trip"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default BookingPage;
