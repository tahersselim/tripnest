"use client";
import { useEffect, useRef, useState, FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

// Component
const Contact = () => {
  const { data: session, status } = useSession();
  const [name, setName] = useState<string>("Your Name");
  const [email, setEmail] = useState<string>("Your Email");

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setName(session.user.name || "Your Name");
      setEmail(session.user.email || "Your Email");
    }
  }, [status, session]);

  const form = useRef<HTMLFormElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendEmail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (form.current) {
      emailjs
        .sendForm(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string,
          form.current,
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string
        )
        .then(
          () => {
            toast.success("The email was sent successfully");
            setIsLoading(false);
            e.currentTarget.reset(); // Reset the form after success
          },
          (error) => {
            toast.error("Failed to send the email. Please try again later.");
            setIsLoading(false);
            console.log("FAILED...", error.text);
          }
        );
    }
  };

  return (
    <div
      className="relative bg-cover bg-center min-h-screen"
      style={{ backgroundImage: "url('/email.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-center text-white mb-4">Contact Me</h1>
        <p className="text-lg text-gray-200 text-center mb-8" id="contact-description">
          Please fill out the form below to discuss any work opportunities.
        </p>
        <div className="h-[90vh] flex flex-col md:flex-row items-center">
          <form
            className="w-full max-w-md mx-auto bg-transparent p-8 shadow-md rounded-lg"
            ref={form}
            onSubmit={sendEmail}
          >
            <input
              type="text"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={name}
              name="your_name"
              required
            />
            <input
              type="email"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={email}
              name="your_email"
              required
            />
            <textarea
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="message"
              rows={5}
              placeholder="Your Message"
              required
            ></textarea>
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
