// types.ts
export type User = {
  id: string;
  name?: string;
  email?: string | null;
  image?: string | null;
  role: string
  adminUser:Admin;
};
export type email = {
  email: string;
}
export type Trip = {
  trip:Trip;
  id: number;
  title: string;
  description: string;
  price: number;
  status:string;
  cutOffTimeInMinutes: number;
  totalprice: number;
  totalPrice:number;
  createdBy:email;
  availableSeats: number;
  bookingId:number;
  paymentStatus:string;
  duration: string;
  destination: string;
  imageUrl: string;
  departureDate: string;
  returnDate: string;
};
export type booking = {
  id: number;
  trip: Trip;
  tripId: number;
  user: User;
  phoneNumber: string;
  Admin: Admin;
  Address: string;
  userId: string;
  bookingDate: string;
  status: string;
  paymentStatus: string;
  numberOfSeats: number;
  totalPrice: number;
};
export type Admin = {
  id:number;
  name:string;
  email:string; 
  password:string
  role:string;
  createdAt: string;
  updatedAt: string;
  Trip: Trip[];
};

export type payment = {
  id: number;
  paymentId: string;
  booking: booking;
  bookingId: string;
  user: User;
  userId: string;
  paymentMethod: string;
  amount: number;
  paymentDate: string;
  paymentStatus: string;
  createdAtDateTime: string;
  updatedAtDateTime: string;
};

export type TripStore = {
  fullname: string;
  Address: string;
  phone: string;
  title: string;
  destination: string;
  guest: string;
  totalprice: string;
  departureDate: string;
  returnDate: string;
  duration: string;
};
export type ActionTypes = {
  confirmPayment: (item: TripStore) => void;
};
