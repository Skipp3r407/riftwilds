import type { NextConfig } from "next";
import os from "os";
import path from "path";

/** Fail production builds if Development Override env flags were left on. */
function assertNoDevOverrideInProdConfig(): void {
  const flag = (v: string | undefined) => {
    if (!v) return false;
    const n = v.trim().toLowerCase();
    return n === "true" || n === "1" || n === "yes" || n === "on";
  };
  if (process.env.NODE_ENV !== "production") return;
  if (flag(process.env.DEV_OVERRIDE) || flag(process.env.NEXT_PUBLIC_DEV_OVERRIDE)) {
    throw new Error(
      "[DEV_OVERRIDE] Refusing production Next config load: clear DEV_OVERRIDE / NEXT_PUBLIC_DEV_OVERRIDE.",
    );
  }
}
assertNoDevOverrideInProdConfig();

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

/** LAN/hostnames used when testing `next dev` from phones or 127.0.0.1. */
function localDevOrigins(): string[] {
  const hosts = new Set<string>(["127.0.0.1", "localhost"]);
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets ?? []) {
      if (net.family === "IPv4" && !net.internal) hosts.add(net.address);
    }
  }
  const extra = process.env.ALLOWED_DEV_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean);
  for (const h of extra ?? []) hosts.add(h);
  return [...hosts];
}

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // Dev needs ws:/http: for HMR + phone-on-LAN; prod stays tight.
  isProd ? "connect-src 'self' https: wss:" : "connect-src 'self' http: https: ws: wss:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // NEVER enable upgrade-insecure-requests on plain HTTP (phone LAN / local IP).
  // Browsers treat localhost specially; mobile via http://192.168.x.x breaks otherwise.
  ...(isProd ? ["upgrade-insecure-requests"] : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Phone / 127.0.0.1 access to `next dev` (blocked by default in Next 16).
  allowedDevOrigins: localDevOrigins(),
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
          value: cspDirectives.join("; "),
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
