import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { getAuthOnboardingPlan } from "@/lib/auth/modular-auth";
import { listAuthProviders } from "@/lib/auth/providers";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "auth-onboarding",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  return jsonOk(
    {
      enabled: featureFlagDefaults.AUTH_MODULAR_LOGIN_UI_ENABLED,
      plan: getAuthOnboardingPlan(),
      providers: listAuthProviders(),
    },
    guard.requestId,
  );
}
