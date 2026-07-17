import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { createRequestId } from "@/lib/utils/request-id";

export async function POST() {
  const requestId = createRequestId();
  await destroySession();
  return NextResponse.json({ requestId, ok: true });
}
