import { z } from "zod";
import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import {
  createPurchaseOrder,
  getPurchaseOrder,
  listPurchaseOrders,
  preparePurchaseOrder,
  verifyPurchaseSimulation,
} from "@/lib/economy/sol";

const createSchema = z.object({
  action: z.literal("create").optional(),
  userId: z.string().min(2).max(80),
  sku: z.string().min(2).max(120),
  requestId: z.string().min(6).max(120),
});

const prepareSchema = z.object({
  action: z.literal("prepare"),
  orderId: z.string().min(4).max(120),
});

const verifySchema = z.object({
  action: z.literal("verify"),
  orderId: z.string().min(4).max(120),
  clientTxSignature: z.string().max(200).optional(),
});

const listSchema = z.object({
  action: z.literal("list"),
  userId: z.string().min(2).max(80),
});

/** Soft/devnet SOL purchase simulation — production settlement stays disabled. */
export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "economy-sol-purchase",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400, "bad_request");
  }

  const action = (body as { action?: string }).action ?? "create";

  if (action === "list") {
    const parsed = listSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid list payload", 400, "validation_error");
    return jsonOk({ orders: listPurchaseOrders(parsed.data.userId) }, guard.requestId);
  }

  if (action === "prepare") {
    const parsed = prepareSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid prepare payload", 400, "validation_error");
    const result = preparePurchaseOrder({ orderId: parsed.data.orderId });
    if (!result.ok) return jsonError(result.message, 400, result.error);
    return jsonOk(
      {
        order: result.order,
        settlementState: result.settlement.state,
        productionDisabled: true,
        note: "Soft prepare only — no chain broadcast.",
      },
      guard.requestId,
    );
  }

  if (action === "verify") {
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid verify payload", 400, "validation_error");
    const result = verifyPurchaseSimulation({
      orderId: parsed.data.orderId,
      clientTxSignature: parsed.data.clientTxSignature,
    });
    if (!result.ok) return jsonError(result.message, 400, result.error);
    return jsonOk(
      {
        order: result.order,
        entitlement: result.entitlement,
        idempotentReplay: result.idempotentReplay,
        simulated: true,
        productionDisabled: true,
      },
      guard.requestId,
    );
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid create payload", 400, "validation_error");
  const result = createPurchaseOrder(parsed.data);
  if (!result.ok) return jsonError(result.message, 400, result.error);
  return jsonOk(
    {
      order: result.order,
      settlementState: result.settlement.state,
      idempotentReplay: result.idempotentReplay,
      productionDisabled: true,
      next: "Call action=prepare then action=verify for soft/devnet simulation.",
    },
    guard.requestId,
  );
}

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "economy-sol-purchase-get",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  if (orderId) {
    const order = getPurchaseOrder(orderId);
    if (!order) return jsonError("Order not found", 404, "not_found");
    return jsonOk({ order, productionDisabled: true }, guard.requestId);
  }
  const userId = url.searchParams.get("userId");
  if (!userId) return jsonError("orderId or userId required", 400, "validation_error");
  return jsonOk({ orders: listPurchaseOrders(userId), productionDisabled: true }, guard.requestId);
}
