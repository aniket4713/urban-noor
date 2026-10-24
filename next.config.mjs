/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage public URLs
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    // keep server-only packages out of the client bundle
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs", "razorpay"],
  },
};

export default nextConfig;
