import type { NextConfig } from "next";
import path from "path";

const r2Public = process.env.R2_PUBLIC_URL;
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

if (r2Public) {
  try {
    const url = new URL(r2Public);
    remotePatterns.push({
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      pathname: "/**",
    });
  } catch {
    /* ignore invalid R2_PUBLIC_URL at build */
  }
}

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
    // Next 16 defaults block query strings on local images unless configured.
    // Allow cache-bust params on /assets/**; other local paths stay query-free.
    localPatterns: [
      { pathname: "/assets/**" },
      { pathname: "/**", search: "" },
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        ...(isProd
          ? [
              {
                key: "Strict-Transport-Security",
                value: "max-age=63072000; includeSubDomains; preload",
              },
            ]
          : []),
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "connect-src 'self' https: wss:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
            "upgrade-insecure-requests",
          ].join("; "),
        },
      ],
    },
  ],
  webpack: (config) => {
    config.externals = [...(config.externals ?? []), "pino-pretty", "lokijs", "encoding"];
    config.resolve.alias = {
      ...config.resolve.alias,
      // Prefer browser build; Phaser's package "main" points at Node-hostile sources.
      phaser: path.resolve(process.cwd(), "node_modules/phaser/dist/phaser.min.js"),
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
