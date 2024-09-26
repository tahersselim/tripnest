"use client";
import { Trip, User } from "@/types/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const getData = async (): Promise<User | null> => {
  try {
    const res = await fetch("http://localhost:3000/api/user", {
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

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/"); 
    } else if (status === "authenticated" && session?.user?.isAdmin) {
      router.push("/adminDb"); 
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

  const { data: trips, isLoading, error } = useQuery<Trip[]>({
    queryKey: ["trips"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/usertrips", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch trips data");
      }
      return res.json();
    },
    enabled: status === "authenticated", // Only fetch if authenticated
  });

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const res = await fetch(`http://localhost:3000/api/usertrips/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to delete trip");
      }
      return res.json();
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip deleted successfully.");
    },
    onError() {
      toast.error("Failed to delete trip.");
    },
  });


  // Handle delete trip
  const handleDelete = (id: number) => {
    mutation.mutate({ id });
  };

  if (status === "loading" || isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading trips: {error.message}</p>;
  }
  return (
    <main className="flex-1 p-6">
      {/* Header Section */}
      <header className="mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">
          Welcome, {user?.name || "User"}!
        </h2>
      </header>

      {/* User Information */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center">
          <Image
            src={user?.image ? user.image : "/user.png"}
            alt="Profile"
            width={100}
            height={100}
            className="rounded-full"
          />
          <div className="ml-6">
            <p className="text-gray-700">Name: {user?.name || "user"}</p>
            <p className="text-gray-700">Email: {user?.email || "Email@example.com"}</p>
          </div>
        </div>
      </section>

      {/* Booking and Payment Information */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Bookings & Payments</h3>

        {trips && trips.length > 0 ? (
          <table className="table-auto w-full text-left">
            <thead>
              <div className="mt-4 text-red-500 font-semibold">
                Note: Delete cannot be undone.
              </div>
              <tr className="bg-gray-100">
                <th className="p-4 text-gray-700">Trip</th>
                <th className="p-4 text-gray-700">Departure</th>
                <th className="p-4 text-gray-700">Return</th>
                <th className="p-4 text-gray-700">Status</th>
                <th className="p-4 text-gray-700">Amount</th>
                <th className="p-4 text-gray-700">Payment Status</th>
                <th className="p-4 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip:Trip) => (
                <tr key={trip.id} className="border-t">
                  <td className="p-4">{trip.trip.destination}</td>
                  <td className="p-4">{(trip.trip.departureDate).slice(0, 10) + " At " + (trip.trip.departureDate).slice(11, 16)}</td>
                  <td className="p-4">{(trip.trip.returnDate).slice(0, 10) + " At " + (trip.trip.returnDate).slice(11, 16)}</td>
                  <td className="p-4">{trip.status}</td>
                  <td className="p-4">EGP {trip.totalPrice}</td>
                  <td className="p-4">{trip.paymentStatus}</td>
                  <td className="p-4">
                    {trip.paymentStatus === "PAID" ? (
                      <Image className="ml-6" src="/right.png" alt="right" height={40} width={40} />
                    ) : (
                      <div className="flex justify-between">
                        <Link href={`/checkout/${trip.bookingId}`} className="bg-yellow-500 text-white px-3 py-1 rounded-md">Pay Now</Link>
                        <button
                          disabled={mutation.isPending}
                          onClick={() => handleDelete(trip.bookingId)}
                          className="text-white px-3 py-1 rounded-md"
                        >
                          <Image src="/delete.png" alt="delete" height={30} width={30} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No bookings found.</p>
        )}
      </section>
    </main>
  );
};

export default Dashboard;
