"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Trip } from '@/types/type';

const BookingPage: React.FC<{ params: { id: number } }> = ({ params }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [trips, setTrips] = useState<Trip | null>(null);

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
                const res = await fetch(`/api/trips/${params.id}`, { cache: "no-store" });
                if (!res.ok) {
                    throw new Error("Failed to fetch data!");
                }
                const data = await res.json();
                setTrips(data);
            } catch (error) {
                console.error(error);
                router.push("/adminDb");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id, router, status]);

    const handleDelete = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/trips/${params.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Trip deleted successfully.");
                router.push("/adminDb");
            } else {
                const data = await res.json();
                toast.error(`Failed to delete trip: ${data.message}`);
            }
        } catch (error) {
            console.error("Error occurred:", error);
            toast.error("An error occurred while trying to delete the trip.");
        }
    };


    const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = (e.target.files as FileList)[0];
        setFile(file);
    };

    const uploadImage = async () => {
        if (!file) return null;
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "restaurant");

        const res = await fetch("https://api.cloudinary.com/v1_1/dcxspln3s/image/upload", {
            method: "POST",
            body: data,
        });

        const resData = await res.json();
        return resData.url;
    };

    const handleUpdates = async (e: React.FormEvent<HTMLFormElement>, tripId: number) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const url = file ? await uploadImage() : null;

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

        const updatedData = {
            title: formData.get('tripTitle') as string,
            destination: formData.get('tripDestination') as string,
            description: formData.get('tripDescription') as string,
            price: parseInt(formData.get('paxPrice') as string, 10),
            duration: formData.get('tripDuration') as string,
            availableSeats: parseInt(formData.get('availableSeats') as string, 10),
            departureDate: departureDate.toISOString(),
            returnDate: returnDate.toISOString(),
            cutOffTimeInMinutes: parseInt(formData.get('cutoff') as string, 10),
            imageUrl: url,
        };

        try {
            const res = await fetch(`http://localhost:3000/api/trips/${tripId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (res.ok) {
                toast.success("Trip updated successfully!");
                window.location.reload();
            } else {
                throw new Error('Failed to update trip');
            }
        } catch (error) {
            console.error('Error updating trip:', error);
            toast.error('Failed to update trip, please make sure you added an image before saving changes');
        } finally {
            setLoading(false);
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
                <h1 className="text-2xl font-bold mb-6">Trip Details (ID: {trips?.id})</h1>
                <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white float-right mt-2 px-4 py-2 rounded mr-4 hover:bg-red-600"
                    disabled={loading}
                >
                    {loading ? "Delete Trip" : "Delete Trip"}
                </button>
            </header>
            <Link href="/adminDb" className="text-blue-600 font-bold text-xl mr-4 hover:underline pl-2">
                Back to DB
            </Link>
            <section className="bg-white p-6 rounded-lg shadow-md ">
                <form onSubmit={(e) => {
                    if (trips && trips.id) {
                        handleUpdates(e, trips.id);
                    }
                }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="TripTitle" className="block text-gray-700 mb-1">Trip Title</label>
                            <input
                                type="text"
                                id="tripTitle"
                                name="tripTitle"
                                defaultValue={trips?.title}
                                placeholder="Trip Title"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="TripDestinatio" className="block text-gray-700 mb-1">Trip Destination</label>
                            <input
                                type="text"
                                id="tripDestination"
                                name="tripDestination"
                                defaultValue={trips?.destination}
                                placeholder="destination"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="TripDescription" className="block text-gray-700 mb-1">Trip Description</label>
                            <textarea
                                id="tripDescription"
                                name="tripDescription"
                                placeholder="Description"
                                defaultValue={trips?.description}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="PaxPrice" className="block text-gray-700 mb-1"> Pax Price</label>
                            <input
                                type="number"
                                min={1}
                                id="paxPrice"
                                defaultValue={trips?.price}
                                name="paxPrice"
                                placeholder="price"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="TripDuration" className="block text-gray-700 mb-1"> Trip Duration</label>
                            <input
                                type="text"
                                id="tripDuration"
                                name="tripDuration"
                                defaultValue={trips?.duration}
                                placeholder="1 day"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="AvailableSeats" className="block text-gray-700 mb-1">Available Seats</label>
                            <input
                                type="number"
                                min={1}
                                id="availableSeats"
                                name="availableSeats"
                                defaultValue={trips?.availableSeats}
                                placeholder="Minimum 1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="DepartureDate" className="block text-gray-700 mb-1">Departure Date</label>
                            <input
                                type="datetime-local" id="departureDate" name="departureDate"
                                defaultValue={trips?.departureDate ? formatDateTimeLocal(trips.departureDate) : ""}
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
                                defaultValue={trips?.returnDate ? formatDateTimeLocal(trips.returnDate) : ""}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="Image" className="block text-gray-700 mb-1">Image</label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                defaultValue={trips?.imageUrl}
                                onChange={handleChangeImage}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    <div className="mt-6">
                        <button type='submit' className="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-600"
                            disabled={loading}>
                            {loading ? "saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default BookingPage;
