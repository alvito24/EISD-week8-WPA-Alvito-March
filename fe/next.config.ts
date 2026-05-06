import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // Disable hanya saat development — untuk test, jalankan `npm run build && npm start`

  disable: process.env.NODE_ENV === "development",
  register: true,

  // Fallback halaman offline jika user tidak punya koneksi & halaman belum ter-cache
  fallbacks: {
    document: "/offline",
  },

  workboxOptions: {
    // Runtime caching untuk endpoint API ideas
    // Strategi NetworkFirst: utamakan data terbaru dari network,
    // fallback ke cache jika offline
    runtimeCaching: [
      {
        // Cocokkan URL backend (environment variable atau localhost)
        urlPattern: ({ url }: { url: URL }) =>
          url.pathname.startsWith("/api/ideas"),
        handler: "NetworkFirst" as const,
        options: {
          cacheName: "quickideas-api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // Cache berlaku 24 jam
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
