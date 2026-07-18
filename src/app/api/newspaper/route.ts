import { NextResponse } from "next/server";
import { generateDailyNewspaper } from "@/lib/newspaper";
import { withApiGuard } from "@/lib/security/api-guard";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "newspaper",
    limit: 120,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const issue = generateDailyNewspaper();
  return NextResponse.json({
    requestId: guard.requestId,
    issue,
  });
}
