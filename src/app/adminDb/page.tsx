"use client"
import { Admin, booking, payment, Trip, User } from '@/types/type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';


const getData = async (): Promise<User | null> => {
  try {
    const res = await fetch("/api/user", {
      cache: 'default',
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
const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState("Users");
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [trips, settrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<booking[]>([]);
  const [payments, setPayments] = useState<payment[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && !session?.user?.isAdmin) {
      router.push("/dashboard");
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

  useEffect(() => {
    const fetchData = async () => {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }
      try {
        const res = await fetch("/api/admin", { cache: 'default' });
        if (!res.ok) {
          throw new Error("Failed to fetch data!");
        }
        const data = await res.json();
        setBookings(data.bookings || []);
        setPayments(data.payments || []);
        settrips(data.trips || []);
        setAdmins(data.Admins || []);
      } catch (error) {
        console.error(error);
        router.push("/404");
      }
    };

    fetchData();
  }, [router, status]);

  const { isPending, data } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      const data = await res.json()
      return data.users;

    }
  })

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ id, newRole }: { id: string, newRole: string }) => {
      return fetch(`/api/admin/${id}`, {
        method: "PUT",
        headers: {
          "content-Type": "application/json"
        },
        body: JSON.stringify({ newRole }),
      })
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const handleRoleChange = (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const input = form.elements[0] as HTMLInputElement
    const newRole = input.value
    mutation.mutate({ id, newRole })
    toast.success("the Role has been changed")
  }


  if (isPending || status === "loading") return 'Loading...'
  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white h-auto md:h-screen p-4 md:p-6 mt-6 ">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => setActiveSection("Users")}
              className={`w-full text-left py-2 px-4 rounded-lg ${activeSection === "Users" ? "bg-blue-600" : "hover:bg-gray-200"
                }`}
            >
              Users
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection("Bookings")}
              className={`w-full text-left py-2 px-4 rounded-lg ${activeSection === "Bookings" ? "bg-blue-600" : "hover:bg-gray-200"
                }`}
            >
              Bookings
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection("Payments")}
              className={`w-full text-left py-2 px-4 rounded-lg ${activeSection === "Payments" ? "bg-blue-600" : "hover:bg-gray-200"
                }`}
            >
              Payments
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection("Trips")}
              className={`w-full text-left py-2 px-4 rounded-lg ${activeSection === "Trips" ? "bg-blue-600" : "hover:bg-gray-200"
                }`}
            >
              Trips
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection("addadmin")}
              className={`w-full text-left py-2 px-4 rounded-lg ${activeSection === "addadmin" ? "bg-blue-600" : "hover:bg-gray-200"
                }`}
            >
              Add Admin
            </button>
          </li>

        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        {/* Admin User Section */}
        <section className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-6 border border-blue-300">
          <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-4">Admin User</h3>
          <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-4 p-4 bg-blue-100 rounded-md">
            <div className="w-16 h-16 md:w-16 md:h-20 relative mb-4 md:mb-0">
              <Image
                src={session?.user.image ? session?.user.image : "/user.png"}
                alt="Admin Profile"
                fill
                className="rounded-full"
              />
            </div>

            {/* Admin Details */}
            <div>
              <p className="text-md md:text-lg font-semibold text-blue-800">Admin Role: Full Access</p>
              <p className="text-gray-600">Username: {user?.adminUser.name || "User"}</p>
              <p className="text-gray-600">Email: {user?.adminUser.email || "Email@example.com"}</p>
              <p className="text-gray-600">Admin ID: {user?.adminUser.id || "Admin ID"}</p>
            </div>
          </div>
          <p className="mt-4 text-blue-600 font-semibold text-sm md:text-base">
            You have full administrative control over users, bookings, and payments.
          </p>
          <div className="mt-4 text-blue-600 font-semibold text-sm">
            Hint: Please note that changing the user role is not enogh to add trips you would have to add the admin details in the admins table using the ADD admin button in the left Sidebar.
          </div>
        </section>

        {/* Conditional Rendering Based on Selected Section */}
        {activeSection === "Users" && (
          <section className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-6 border border-green-300">
            <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-4">Users</h3>
            <div className="mt-4 text-red-500 font-semibold">Note: Changes cannot be undone.</div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-sm md:text-base">
                <thead>
                  <tr>
                    <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bold">User ID</th>
                    <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bold">Name</th>
                    <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bold">Email</th>
                    <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bold">Role</th>
                    <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((user: User) => (
                    <tr key={user.id} className="border-t">
                      <td className="py-2 px-2 md:px-4 border-b">{user.id}</td>
                      <td className="py-2 px-2 md:px-4 border-b">{user.name}</td>
                      <td className="py-2 px-2 md:px-4 border-b">{user.email}</td>
                      <td className="py-2 px-2 md:px-4 border-b">
                        <form onSubmit={(e) => handleRoleChange(e, user.id)}>
                          <select defaultValue={user.role} className="border rounded p-1">
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button type="submit" className="text-blue-600 font-bold mr-4 hover:underline pl-2">
                            OK
                          </button>
                        </form>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-yellow-500 font-semibold">
              Warning: Ensure all details are correct before submission.
            </div>
          </section>
        )}

        {activeSection === "Bookings" && (
          <section className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-6 border border-green-300">
            <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-4">Bookings</h3>
            <div className="mt-4 text-red-500 font-semibold">Note: Changes cannot be undone.</div>
            <table className="min-w-full bg-white text-sm md:text-base">
              <thead>
                <tr>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Booking ID</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Trip</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">User</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">B/Status</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">T/pax</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">total/p</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: booking) => (
                  <tr key={booking.id} className="border-t">
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editbookings/${booking.id}`} className=" hover:underline hover:text-blue-600 ">
                        {booking.id}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editbookings/${booking.id}`} className=" hover:underline hover:text-blue-600 ">
                        {booking.trip.title}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editbookings/${booking.id}`} className=" hover:underline hover:text-blue-600 ">
                        {booking.user.name}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editbookings/${booking.id}`} className=" hover:underline hover:text-blue-600 ">
                        {booking.status}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editbookings/${booking.id}`} className=" hover:underline hover:text-blue-600 ">
                        {booking.numberOfSeats}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editbookings/${booking.id}`} className=" hover:underline hover:text-blue-600 ">
                        {booking.totalPrice}
                      </Link>
                    </td>

                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editbookings/${booking.id}`} className="text-blue-600 font-bold hover:underline ">Edit</Link>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
            <div className="mt-4 text-yellow-500 font-semibold">
              Warning: Ensure all details are correct before submission.
            </div>
          </section>
        )}

        {activeSection === "Payments" && (
          <section className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-6 border border-green-300">
            <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-4">Payments</h3>
            <div className="mt-4 text-red-500 font-semibold">Note: Changes cannot be undone.</div>
            <table className="min-w-full bg-white text-sm md:text-base">
              <thead>
                <tr>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Payment ID</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">User</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Amount</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Status</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: payment) => (
                  <tr key={payment.id} className={`border-t ${payment.paymentStatus === "UNPAID" ? "bg-red-200" : ""}`}>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editbookings/${payment.id}`} className=" hover:underline hover:text-blue-600 ">
                        {payment.id}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editbookings/${payment.user.name}`} className=" hover:underline hover:text-blue-600 ">
                        {payment.user.name}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editbookings/${payment.amount}`} className=" hover:underline hover:text-blue-600 ">
                        {payment.amount}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editbookings/${payment.paymentStatus}`} className=" hover:underline hover:text-blue-600 ">
                        {payment.paymentStatus}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/editpayment/${payment.id}`} className="text-blue-600 font-bold hover:underline ">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-yellow-500 font-semibold">
              Warning: Ensure all details are correct before making changes.
            </div>
          </section>
        )}
        {activeSection === "Trips" && (
          <section className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-6 border border-green-300">
            <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-4">Trips</h3>
            <div className="mt-4 text-red-500 font-semibold">Note: Changes cannot be undone.</div>
            <table className="min-w-full bg-white text-sm md:text-base">
              <thead>
                <tr>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Trip ID</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Title</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Destination</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Price</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Created By</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip: Trip) => (
                  <tr key={trip.id} className={'border-t'}>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`/trip/${trip.id}`} className=" hover:underline hover:text-blue-600 ">
                        {trip.id}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`/trip/${trip.id}`} className=" hover:underline hover:text-blue-600 ">
                        {trip.title}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`/trip/${trip.id}`} className=" hover:underline hover:text-blue-600 ">
                        {trip.destination}
                      </Link>
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      {trip.price} EGP
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b">{trip.createdBy.email}</td>
                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/viewtrips/${trip.id}`} className="text-blue-600 px-2 font-bold mr-4 hover:underline">View / Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6">
              <Link
                href="adminDb/addtrip"
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-600"
              >Create a New Trip
              </Link>
            </div>
            <div className="mt-4 text-yellow-500 font-semibold">
              Warning: Ensure all details are correct before making changes.
            </div>
          </section>
        )}
        {activeSection === "addadmin" && (
          <section className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-6 border border-green-300">
            <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-4">Admins</h3>
            <div className="mt-4 text-red-500 font-semibold">Note: Changes cannot be undone.</div>
            <table className="min-w-full bg-white text-sm md:text-base">
              <thead>
                <tr>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Admin ID</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Name</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Email</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Created At</th>
                  <th className="py-2 px-2 md:px-4 bg-green-100 text-left text-gray-700 font-bol">Action</th>

                </tr>
              </thead>
              <tbody>
                {admins.map((admin: Admin) => (
                  <tr key={admin.id} className='border-t'>
                    <td className="py-2 px-2 md:px-4 border-b">{admin.id}</td>
                    <td className="py-2 px-2 md:px-4 border-b">{admin.name}</td>
                    <td className="py-2 px-2 md:px-4 border-b">{admin.email}</td>
                    <td className="py-2 px-2 md:px-4 border-b">{admin.createdAt.slice(0, 10)}</td>

                    <td className="py-2 px-2 md:px-4 border-b">
                      <Link href={`adminDb/addadmin`} className="text-blue-600 px-2 font-bold mr-4 hover:underline">ADD</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-blue-500 font-semibold">
              Info: if you need to delete the admin user please contact your support team.
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
