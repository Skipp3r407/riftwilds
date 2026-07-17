/**
 * Load-test stub — documents intended k6/Artillery scenarios for decade APIs.
 * Does not open network sockets; prints a scenario matrix for CI wiring later.
 */

const SCENARIOS = [
  { name: "world_clock_read", method: "GET", path: "/api/world/clock", rps: 50 },
  { name: "ecosystem_read", method: "GET", path: "/api/ecosystem", rps: 20 },
  { name: "expedition_generate", method: "POST", path: "/api/expeditions/generate", rps: 10 },
  { name: "civilization_contribute", method: "POST", path: "/api/civilization", rps: 5 },
  { name: "archivist_consult", method: "GET", path: "/api/archivist", rps: 15 },
  { name: "achievements_read", method: "GET", path: "/api/achievements", rps: 20 },
] as const;

console.log(
  JSON.stringify(
    {
      status: "STUB",
      note: "Wire to k6/Artillery when staging exists. Rate limits enforced via withApiGuard.",
      scenarios: SCENARIOS,
      assertions: [
        "p95 latency < 300ms for read APIs on staging",
        "429 responses when exceeding guard limits",
        "no 5xx under sustained read load",
      ],
    },
    null,
    2,
  ),
);
