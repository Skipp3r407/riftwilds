import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import {
  claimPlot,
  donateToProject,
  electMayor,
  getNeighborhood,
  listNeighborhoods,
  neighborhoodSnapshot,
  openStorefront,
  proposeCosmeticMotion,
  scheduleNeighborhoodEvent,
  setSeasonalDecor,
  tickNeighborhoodMaintenance,
} from "@/lib/neighborhoods";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  action: z.enum([
    "claim",
    "donate",
    "elect_mayor",
    "motion",
    "storefront",
    "event",
    "seasonal",
    "maintain",
    "snapshot",
  ]),
  plotId: z.string().optional(),
  neighborhoodId: z.string().optional(),
  projectId: z.string().optional(),
  materials: z.number().int().optional(),
  deedSize: z
    .enum([
      "tiny",
      "small",
      "medium",
      "large",
      "estate",
      "castle",
      "island",
      "lakefront",
      "cliffside",
      "grove",
    ])
    .optional(),
  homeName: z.string().max(40).optional(),
  propertyTier: z.string().optional(),
  autoBuildHome: z.boolean().optional(),
  title: z.string().optional(),
  kind: z
    .enum([
      "decor_theme",
      "event_schedule",
      "park_name",
      "festival_banner",
      "weekend_market",
      "concert",
      "festival",
      "gathering",
    ])
    .optional(),
  hours: z.number().optional(),
  storeName: z.string().optional(),
  hoursLabel: z.string().optional(),
  displayItemKeys: z.array(z.string()).optional(),
  theme: z.string().optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "neighborhoods",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? undefined;

  const res = NextResponse.json({
    requestId: guard.requestId,
    ...neighborhoodSnapshot(id),
    neighborhoods: id ? [getNeighborhood(id)].filter(Boolean) : listNeighborhoods(),
    minePlot:
      listNeighborhoods()
        .flatMap((n) => n.plots)
        .find((p) => p.ownerUserId === ownerKey) ?? null,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "neighborhoods-write",
    limit: 50,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const d = parsed.data;
  let result: Record<string, unknown> = { ok: false, error: "unhandled" };

  switch (d.action) {
    case "claim":
      if (!d.plotId) {
        result = { ok: false, error: "MISSING_PLOT" };
        break;
      }
      result = claimPlot({
        userId: ownerKey,
        plotId: d.plotId,
        requestId: guard.requestId,
        deedSize: d.deedSize,
        homeName: d.homeName,
        propertyTier: d.propertyTier as never,
        autoBuildHome: d.autoBuildHome,
      });
      break;
    case "donate":
      if (!d.neighborhoodId || !d.projectId || !d.materials) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = donateToProject({
        userId: ownerKey,
        neighborhoodId: d.neighborhoodId,
        projectId: d.projectId,
        materials: d.materials,
        requestId: guard.requestId,
      });
      break;
    case "elect_mayor":
      if (!d.neighborhoodId) {
        result = { ok: false, error: "MISSING_NBHD" };
        break;
      }
      result = electMayor({ neighborhoodId: d.neighborhoodId, userId: ownerKey });
      break;
    case "motion":
      if (!d.neighborhoodId || !d.title || !d.kind) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      if (
        d.kind !== "decor_theme" &&
        d.kind !== "event_schedule" &&
        d.kind !== "park_name" &&
        d.kind !== "festival_banner"
      ) {
        result = { ok: false, error: "BAD_MOTION_KIND" };
        break;
      }
      result = proposeCosmeticMotion({
        neighborhoodId: d.neighborhoodId,
        userId: ownerKey,
        title: d.title,
        kind: d.kind,
      });
      break;
    case "storefront":
      if (!d.plotId || !d.storeName) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = openStorefront({
        userId: ownerKey,
        plotId: d.plotId,
        name: d.storeName,
        hours: d.hoursLabel,
        displayItemKeys: d.displayItemKeys,
      });
      break;
    case "event":
      if (!d.neighborhoodId || !d.title || !d.kind) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      if (
        d.kind !== "weekend_market" &&
        d.kind !== "concert" &&
        d.kind !== "festival" &&
        d.kind !== "gathering"
      ) {
        result = { ok: false, error: "BAD_EVENT_KIND" };
        break;
      }
      result = scheduleNeighborhoodEvent({
        neighborhoodId: d.neighborhoodId,
        userId: ownerKey,
        title: d.title,
        kind: d.kind,
        hours: d.hours,
      });
      break;
    case "seasonal":
      if (!d.neighborhoodId || !d.theme) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = setSeasonalDecor({
        neighborhoodId: d.neighborhoodId,
        theme: d.theme,
        userId: ownerKey,
      });
      break;
    case "maintain":
      if (!d.neighborhoodId) {
        result = { ok: false, error: "MISSING_NBHD" };
        break;
      }
      result = {
        ok: true,
        neighborhood: tickNeighborhoodMaintenance(d.neighborhoodId),
      };
      break;
    case "snapshot":
      result = { ok: true, ...neighborhoodSnapshot(d.neighborhoodId) };
      break;
  }

  const res = NextResponse.json({
    ...result,
    requestId: guard.requestId,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
