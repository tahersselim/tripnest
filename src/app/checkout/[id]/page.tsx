"use client"
import { booking, Trip, User } from '@/types/type';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';


const CheckoutPage: React.FC<{ params: { id: number } }> = ({ params }) => {
  const { data: session, status } = useSession();
  const [Booking, setBooking] = useState<booking | null>(null);
  const [Trip, setTrip] = useState<Trip | null>(null);
  const [User, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`/api/checkout/${params.id}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to fetch booking data!");
        }
        const booking = await res.json();
        if(booking.paymentStatus === "PAID"){
          router.push("/");
          return;
        }
        setBooking(booking);
        setTrip(booking.trip);
        setUser(booking.user);
      } catch (error) {
        console.error(error);
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router, status]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!Booking) {
    return <p> !! Something Went Wrong in your Booking Please Try Again Later</p>;
  }
  const { id } = params
  const getAuthToken = async () => {
    try {
      const response = await fetch('https://accept.paymob.com/api/auth/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: 'ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2T1RrMU56RTVMQ0p1WVcxbElqb2lNVGN5TmpNMU16UTNOUzQ1TVRrek5DSjkuOXVrVG5HX1NTRkVkLVVqU21iYnk1SUNzN3h5TVV5UHJVRjdWSzBQd1ZURExzWEVqcGJoNlNiN1pZQVlCaEdmQ2hlWDd1YmM3RlJ3bERfQUhkOG5SY2c=',
        })
      });
      const data = await response.json();
      const token = data.token
      try {
        const response = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            auth_token: token,
            delivery_needed: "false",
            amount_cents: Booking.totalPrice * 100,
            currency: "EGP",
            merchant_order_id: Booking.id,
            items: [
              {
                name: "Booking",
                amount_cents: Booking.totalPrice * 100,
                description: Booking.userId,
                quantity: 1,
              }
            ]
          })
        });
        const data = await response.json();

        const id = data.id;
        try {
          const response = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              auth_token: token,
              amount_cents: Booking.totalPrice * 100,
              expiration: 3600, // 1 hour expiration time for the payment key
              order_id: id,
              billing_data: {
                apartment: "803",
                email: User?.email,
                floor: "42",
                first_name: User?.name,
                street: "Example Street",
                building: "8028",
                phone_number: Booking.phoneNumber,
                shipping_method: "PKG",
                postal_code: "01898",
                city: "Cairo",
                country: "EG",
                last_name: "Doe",
                state: "CA",
              },
              currency: "EGP",
              integration_id: 4834158
            })
          });
          const data = await response.json();
          const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/868660?payment_token=${data.token}`
          window.location.href = paymentUrl;
        } catch (error) {
          console.error('Error generating payment key:', error);
        }

      } catch (error) {
        console.error('Error creating order:', error);
      }

    } catch (error) {
      console.error('Error getting auth token:', error);
    }
  };

  const handleDelete = async () => {
    try {
        const res = await fetch(`/api/checkout/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            router.push("/");
        } else {
             await res.json();
        }
    } catch (error) {
        toast.error("An error occurred while trying to delete the product.");
    }
};

  return (
    <main className="flex-1 p-6">
      <header className="mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">Checkout</h2>
      </header>

      <section className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Summary</h3>
        <div className="bg-gray-100 p-4 rounded-lg mb-6">

          <h4 className="text-lg font-semibold text-gray-700 mb-2">Name</h4>
          <p className="text-gray-700 mb-2">{User?.name}</p>

          <h4 className="text-lg font-semibold text-gray-700 mb-2">Address</h4>
          <p className="text-gray-700 mb-2">{Booking.Address}</p>

          <h4 className="text-lg font-semibold text-gray-700 mb-2">Phone Number</h4>
          <p className="text-gray-700 mb-2">{Booking.phoneNumber}</p>


          <h4 className="text-lg font-semibold text-gray-700 mb-2">Email</h4>
          <p className="text-gray-700 mb-2">{User?.email}</p>

          <h4 className="text-lg font-semibold text-gray-700 mb-2">Trip Name</h4>
          <p className="text-gray-700 mb-2">{Trip?.title}</p>

          <h4 className="text-lg font-semibold text-gray-700 mb-2">Destination</h4>
          <p className="text-gray-700 mb-2">{Trip?.destination}</p>

          <h4 className="text-lg font-semibold text-gray-700 mb-2">Departure Date</h4>
          <p className="text-gray-700 mb-2">{Trip?.departureDate.slice(0, 10) + " At " + Trip?.departureDate.slice(11, 16)}</p>

          <h4 className="text-lg font-semibold text-gray-700 mb-2">Return Date</h4>
          <p className="text-gray-700 mb-2">{Trip?.returnDate.slice(0, 10) + " At " + Trip?.returnDate.slice(11, 16)}</p>

          <h4 className="text-lg font-semibold text-gray-700 mb-2">Number of Guests</h4>
          <p className="text-gray-700 mb-2">{Booking.numberOfSeats}</p>

          <h4 className="text-lg font-semibold text-gray-700 mb-2">Total Price</h4>
          <p className="text-gray-700 mb-2">{Booking.totalPrice}</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-gray-700 px-6 py-2 rounded hover:bg-blue-700"
            onClick={getAuthToken}
          >
            checkout
          </button>
        </div>
      </section>
      <div className='pt-4'>
        <button
          type="submit"
          className="bg-primary text-gray-700 px-2 py-2 rounded hover:bg-red-500 text-sm"
          onClick={handleDelete}
        >
          Cancel Order
        </button>
      </div>
    </main>
  );
};

export default CheckoutPage;
