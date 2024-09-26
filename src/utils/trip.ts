import { ActionTypes, TripStore } from "@/types/type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const INITIAL_STATE = {
  fullname: "",
  Address: "",
  phone: "",
  title: "",
  destination: "",
  guest: "",
  totalprice: "",
  departureDate: "",
  returnDate: "",
  duration: "",
};

export const useTrip = create<TripStore & ActionTypes>()(
  persist(
    (set) => ({
      // Initial state
      ...INITIAL_STATE,

      // Action to confirm payment and update state
      confirmPayment: (item) =>
        set((state) => ({
          fullname: item.fullname || state.fullname,
          Address: item.Address || state.Address,
          phone: item.phone || state.phone,
          title: item.title || state.title,
          destination: item.destination || state.destination,
          guest: item.guest || state.guest,
          totalprice: item.totalprice || state.totalprice,
          departureDate: item.departureDate || state.departureDate,
          returnDate: item.returnDate || state.returnDate,
          duration: item.duration || state.duration,
        })),
      
      // Action to reset to initial state (if needed)
      resetTrip: () =>
        set(() => ({
          ...INITIAL_STATE,
        })),
    }),
    {
      name: "trip-store", // Persisting to localStorage with this key
      skipHydration: true,
    }
  )
);
