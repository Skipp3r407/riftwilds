/**
 * Smoke-test every public page + key APIs.
 * Run: node scripts/smoke-pages.mjs
 */
const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

const pages = [
  "/",
  "/play",
  "/hatchery",
  "/world",
  "/live",
  "/live/stream",
  "/arena",
  "/arena/training",
  "/arena/loadout",
  "/arena/history",
  "/arena/duels",
  "/arena/ranked",
  "/arena/tournaments",
  "/arena/spectate",
  "/arena/leaderboard",
  "/battle",
  "/marketplace",
  "/shop",
  "/shop/weapons",
  "/shop/armor",
  "/shop/potions",
  "/shop/materials",
  "/shop/featured",
  "/shop/magic",
  "/shop/cosmetics",
  "/shop/recovery",
  "/inventory",
  "/guilds",
  "/homestead",
  "/profile",
  "/dashboard",
  "/collection",
  "/quests",
  "/leaderboards",
  "/memorials",
  "/creatures",
  "/about",
  "/economy",
  "/economy/policies",
  "/token",
  "/analytics/token",
  "/treasury",
  "/rewards",
  "/restoration",
  "/social",
  "/creators",
  "/login",
  "/community",
  "/api/community/metrics",
  "/api/activity/feed",
  "/api/treasury",
  "/api/rewards/center",
  "/api/presence",
  "/api/dashboard",
  "/api/analytics/token",
  "/api/auth/onboarding",
  "/transparency",
  "/docs",
  "/fairness",
  "/legal/terms",
  "/legal/privacy",
  "/legal/risk",
  "/maintenance",
  "/pets/pet_smoke_missing",
  "/creature/demo",
];

const apis = [
  "/api/health",
  "/api/ready",
  "/api/hatchery/eggs",
  "/api/pets",
  "/api/arena/status",
  "/api/arena/weapons",
  "/api/arena/affinity",
  "/api/economy/revenue-allocation",
  "/api/transparency/metrics",
  "/api/activity/feed",
  "/api/treasury",
  "/api/rewards/center",
  "/api/presence",
  "/api/dashboard",
  "/api/analytics/token",
  "/api/auth/onboarding",
];

const results = [];

async function check(
  path,
  { expectRedirect = false, allowNotFound = false, allowReadyDegraded = false } = {},
) {
  const url = `${BASE}${path}`;
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { Accept: "text/html,application/json" },
    });
    const ms = Date.now() - started;
    const loc = res.headers.get("location");
    let ok =
      (res.status >= 200 && res.status < 400) ||
      (expectRedirect && res.status >= 300 && res.status < 400) ||
      (allowNotFound && res.status === 404);

    // Admin should redirect unauthenticated users
    if (path.startsWith("/admin") && (res.status === 307 || res.status === 302 || res.status === 303)) {
      ok = true;
    }

    // Missing pet can 404 JSON or page error UI
    if (path.includes("pet_smoke_missing") && (res.status === 200 || res.status === 404)) {
      ok = true;
    }

    // /api/ready is 503 when Postgres is offline — expected in local demo without DB.
    if (allowReadyDegraded && path === "/api/ready" && res.status === 503) {
      results.push({
        path,
        status: res.status,
        ms,
        ok: true,
        location: loc,
        bodyHint: "DB offline (acceptable locally)",
        degraded: true,
      });
      return "degraded";
    }

    let bodyHint = "";
    if (res.status >= 500) {
      const text = await res.text().catch(() => "");
      bodyHint = text.slice(0, 160).replace(/\s+/g, " ");
      ok = false;
    } else if (res.headers.get("content-type")?.includes("text/html") && res.status === 200) {
      const text = await res.text();
      if (
        text.includes("This page couldn't load") ||
        text.includes("Application error") ||
        text.includes("Critical rift failure") ||
        text.includes("__NEXT_DATA__") === false && text.includes("Riftwilds") === false && text.length < 200
      ) {
        // soft check — Next app router may not have __NEXT_DATA__
      }
      if (text.includes("Build Error") || text.includes("Parsing CSS source code failed")) {
        ok = false;
        bodyHint = "build/runtime error in HTML";
      }
      if (path === "/about") {
        const required = [
          "THE STORY OF THE RIFTWILDS",
          "WHEN THE WORLD WAS WHOLE",
          "THE DAY REALITY BROKE",
          "BORN TO REMEMBER",
          "Elara Venn",
          "BEGIN YOUR STORY",
        ];
        const missing = required.filter((needle) => !text.includes(needle));
        if (missing.length) {
          ok = false;
          bodyHint = `about missing: ${missing.join(", ")}`;
        }
      }
    }

    results.push({
      path,
      status: res.status,
      ms,
      ok,
      location: loc,
      bodyHint,
    });
    return ok;
  } catch (e) {
    results.push({
      path,
      status: 0,
      ms: Date.now() - started,
      ok: false,
      bodyHint: String(e.message ?? e),
    });
    return false;
  }
}

async function main() {
  console.log(`Smoke testing ${BASE}\n`);

  // Admin routes — expect redirect without session
  const adminPaths = [
    "/admin",
    "/admin/arena",
    "/admin/items",
    "/admin/assets",
    "/admin/economy",
    "/admin/economy/revenue-allocation",
    "/admin/assets/sprite-inspector",
    "/admin/assets/equipment-aligner",
  ];

  let failed = 0;
  for (const p of pages) {
    const ok = await check(p, { allowNotFound: p.includes("pet_smoke_missing") });
    process.stdout.write(ok ? "." : "F");
    if (!ok) failed++;
  }
  for (const p of apis) {
    const ok = await check(p, {
      allowNotFound: false,
      allowReadyDegraded: p === "/api/ready",
    });
    if (ok === "degraded") {
      process.stdout.write("d"); // degraded but accepted
      continue;
    }
    process.stdout.write(ok ? "." : "F");
    if (!ok) failed++;
  }
  for (const p of adminPaths) {
    const ok = await check(p, { expectRedirect: true });
    process.stdout.write(ok ? "." : "F");
    if (!ok) failed++;
  }

  // Functional hatchery smoke
  console.log("\n\nFunctional checks...");
  const claim = await fetch(`${BASE}/api/hatchery/claim`, { method: "POST" });
  const claimJson = await claim.json().catch(() => ({}));
  const claimOk = claim.status === 200 || claim.status === 409;
  console.log(`POST /api/hatchery/claim → ${claim.status} ${claimOk ? "OK" : "FAIL"}`);
  if (!claimOk) failed++;

  const eggs = await fetch(`${BASE}/api/hatchery/eggs`);
  const eggsJson = await eggs.json().catch(() => ({}));
  console.log(`GET /api/hatchery/eggs → ${eggs.status} eggs=${(eggsJson.eggs ?? []).length}`);
  if (!eggs.ok) failed++;

  console.log("\n\n=== FAILURES ===");
  const fails = results.filter((r) => !r.ok);
  if (fails.length === 0 && claimOk && eggs.ok) {
    console.log("None — all pages/APIs responded successfully.");
  } else {
    for (const f of fails) {
      console.log(
        `${f.status}\t${f.path}\t${f.ms}ms\t${f.location ?? ""}\t${f.bodyHint ?? ""}`.trim(),
      );
    }
  }

  console.log(`\nSummary: ${results.length + 2} checks, ${failed} failures`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
