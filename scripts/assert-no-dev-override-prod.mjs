#!/usr/bin/env node
/**
 * Production build safeguard — fail if Development Override env is still enabled
 * on true production. Vercel preview may keep NEXT_PUBLIC_AUTH_DEV_BYPASS temporarily.
 * Wired as `prebuild` in package.json.
 */

function flagTrue(value) {
  if (!value) return false;
  const v = String(value).trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

const vercelEnv = process.env.VERCEL_ENV;
const isPreviewOrVercelDev =
  vercelEnv === "preview" || vercelEnv === "development";

const trueProductionContext =
  !isPreviewOrVercelDev &&
  (process.env.NODE_ENV === "production" ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    vercelEnv === "production" ||
    process.argv.includes("--production"));

if (!trueProductionContext) {
  process.exit(0);
}

const flagged =
  flagTrue(process.env.DEV_OVERRIDE) ||
  flagTrue(process.env.NEXT_PUBLIC_DEV_OVERRIDE) ||
  flagTrue(process.env.AUTH_DEV_BYPASS) ||
  flagTrue(process.env.NEXT_PUBLIC_AUTH_DEV_BYPASS);

if (flagged) {
  console.error(
    "[DEV_OVERRIDE] Refusing production build: unset DEV_OVERRIDE, NEXT_PUBLIC_DEV_OVERRIDE, AUTH_DEV_BYPASS, and NEXT_PUBLIC_AUTH_DEV_BYPASS.",
  );
  process.exit(1);
}

console.log("[DEV_OVERRIDE] Production build check OK — override flags clear.");
