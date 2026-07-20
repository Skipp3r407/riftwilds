#!/usr/bin/env node
/**
 * Production build safeguard — fail if classic Development Override env is still enabled
 * on true production. AUTH_DEV_BYPASS aliases are runtime-gated and do not hard-fail builds
 * (preview projects may keep them set). Wired as `prebuild` in package.json.
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

// Only classic DEV_OVERRIDE flags block production builds.
// AUTH_DEV_BYPASS is refused at runtime when NODE_ENV=production.
if (
  flagTrue(process.env.DEV_OVERRIDE) ||
  flagTrue(process.env.NEXT_PUBLIC_DEV_OVERRIDE)
) {
  console.error(
    "[DEV_OVERRIDE] Refusing production build: unset DEV_OVERRIDE and NEXT_PUBLIC_DEV_OVERRIDE (must be false/absent).",
  );
  process.exit(1);
}

console.log("[DEV_OVERRIDE] Production build check OK — override flags clear.");
