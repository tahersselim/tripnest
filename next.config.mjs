/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      "platform-lookaside.fbsbx.com", // Facebook profile image
      "lh3.googleusercontent.com", // Google profile image
    ],
  },
};

export default nextConfig;

