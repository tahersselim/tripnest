"use client";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Register = () => {
  const { status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "authenticated") {
    router.push("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-full md:w-1/2 bg-gray-100 hidden md:flex items-center justify-center">
        <Image
          src="/login-image.png"  
          alt="Login Image"
          width={600}
          height={800}
          className="object-fit"
        />
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="max-w-md w-full mx-auto bg-gray-100 p-8 ">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
            Register
          </h1>
          <p className="text-lg text-gray-600 text-center mb-6">
            Continue with your preferred social account.
          </p>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={() => signIn("google")}
            >
              <Image
                src="/google.png"
                alt="Google Logo"
                width={20}
                height={20}
                className="mr-2"
              />
              Google
            </button>
            <button
              onClick={() => signIn("facebook")}
              type="button"
              className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <Image
                src="/facebook.png"
                alt="Facebook Logo"
                width={20}
                height={20}
                className="mr-2"
              />
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
