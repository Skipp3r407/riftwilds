#!/usr/bin/env node
/**
 * Production build safeguard — fail if Development Override env is still enabled.
 * Wired as `prebuild` in package.json.
 */

function flagTrue(value) {
  if (!value) return false;
  const v = String(value).trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

const productionContext =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.VERCEL_ENV === "production" ||
  process.argv.includes("--production");

if (!productionContext) {
  process.exit(0);
}

if (flagTrue(process.env.DEV_OVERRIDE) || flagTrue(process.env.NEXT_PUBLIC_DEV_OVERRIDE)) {
  console.error(
    "[DEV_OVERRIDE] Refusing production build: unset DEV_OVERRIDE and NEXT_PUBLIC_DEV_OVERRIDE (must be false/absent).",
  );
  process.exit(1);
}

console.log("[DEV_OVERRIDE] Production build check OK — override flags clear.");
