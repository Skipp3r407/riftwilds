import { NextResponse } from "next/server";
import { getActiveTreasuryPolicy } from "@/lib/config/treasury-policy";
import { createRequestId } from "@/lib/utils/request-id";

export async function GET() {
  const policy = getActiveTreasuryPolicy();
  return NextResponse.json({
    requestId: createRequestId(),
    policy,
    note: "Bootstrap policy from centralized config. Database AllocationPolicy overrides land when published.",
  });
}
