import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { createRequestId } from "@/lib/utils/request-id";

export async function GET() {
  const requestId = createRequestId();
  const session = await getSessionContext();
  return NextResponse.json({
    requestId,
    authenticated: Boolean(session),
    session,
  });
}
