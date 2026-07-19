import { NextResponse } from "next/server";
import { z } from "zod";
import {
  cancelTradeRequest,
  confirmTradeSide,
  createTradeRequest,
  listTradeRequests,
} from "@/lib/marketplace/trade-requests";
import { appendMarketplaceTxLog } from "@/lib/marketplace/security";

const createSchema = z.object({
  action: z.literal("create"),
  initiatorLabel: z.string().min(2).max(64).default("demo-keeper"),
  counterpartyLabel: z.string().min(2).max(64),
  offer: z.object({
    label: z.string().min(1).max(80),
    itemKeys: z.array(z.string()).max(12),
    creditsOffer: z.number().int().min(0).optional(),
  }),
  ask: z.object({
    label: z.string().min(1).max(80),
    itemKeys: z.array(z.string()).max(12),
    creditsOffer: z.number().int().min(0).optional(),
  }),
});

const confirmSchema = z.object({
  action: z.literal("confirm"),
  publicId: z.string().min(4),
  side: z.enum(["initiator", "counterparty"]),
});

const cancelSchema = z.object({
  action: z.literal("cancel"),
  publicId: z.string().min(4),
});

export async function GET() {
  return NextResponse.json({
    trades: listTradeRequests(),
    note: "Trade desk is a double-confirm shell — escrow settlement is not live.",
  });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const action = json?.action as string | undefined;

  if (action === "create") {
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    const trade = createTradeRequest(parsed.data);
    appendMarketplaceTxLog({
      type: "TRADE_CONFIRM",
      actorLabel: trade.initiatorLabel,
      detail: `Created ${trade.publicId}`,
    });
    return NextResponse.json({ trade });
  }

  if (action === "confirm") {
    const parsed = confirmSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    const result = confirmTradeSide(parsed.data.publicId, parsed.data.side);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }
    appendMarketplaceTxLog({
      type: "TRADE_CONFIRM",
      actorLabel: parsed.data.side,
      detail: `${parsed.data.publicId} → ${result.trade.status}`,
    });
    return NextResponse.json({
      trade: result.trade,
      note:
        result.trade.status === "confirmed"
          ? "Both sides confirmed (demo). Escrow transfer is not executed."
          : "Awaiting the other side's confirm.",
    });
  }

  if (action === "cancel") {
    const parsed = cancelSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    const ok = cancelTradeRequest(parsed.data.publicId);
    return NextResponse.json({ ok });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
