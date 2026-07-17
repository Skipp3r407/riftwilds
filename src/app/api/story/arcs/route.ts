import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { SAMPLE_STORY_ARCS } from "@/game/story/arcs/sample-branching";
import { startArc, applyChoice, availableChoices, getNode } from "@/game/story/engine";
import { onStoryChoiceMade } from "@/game/achievements/hooks";
import { trackAnalytics } from "@/lib/analytics/events";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "story-arcs",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.STORY_ENGINE_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  return jsonOk(
    {
      enabled: true,
      arcs: SAMPLE_STORY_ARCS.map((a) => ({
        key: a.key,
        name: a.name,
        synopsis: a.synopsis,
        scope: a.scope,
        regionKey: a.regionKey,
        startNodeId: a.startNodeId,
      })),
    },
    guard.requestId,
  );
}

/** Demo advance — POST { arcKey, choiceId?, reset?: true } */
export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "story-advance",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
    auditAction: "story_choice",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.STORY_ENGINE_ENABLED) {
    return NextResponse.json(
      { ok: false, error: "disabled", requestId: guard.requestId },
      { status: 403 },
    );
  }

  let body: { arcKey?: string; choiceId?: string; reset?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", requestId: guard.requestId },
      { status: 400 },
    );
  }

  const arc = SAMPLE_STORY_ARCS.find((a) => a.key === (body.arcKey ?? "first_rift_light"));
  if (!arc) {
    return NextResponse.json(
      { ok: false, error: "unknown_arc", requestId: guard.requestId },
      { status: 404 },
    );
  }

  let state = startArc(arc);
  if (body.choiceId && !body.reset) {
    state = applyChoice(arc, state, body.choiceId);
    onStoryChoiceMade();
    trackAnalytics("story_choice", { arcKey: arc.key, choiceId: body.choiceId });
  }

  const node = getNode(arc, state.currentNodeId);
  return jsonOk(
    {
      state,
      node,
      choices: availableChoices(arc, state),
    },
    guard.requestId,
  );
}
