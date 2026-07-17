/**
 * Next.js instrumentation — runs once on server boot.
 * Enforces production secrets before serving traffic.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertRuntimeSecrets } = await import("@/lib/config/env");
    assertRuntimeSecrets();
  }
}
