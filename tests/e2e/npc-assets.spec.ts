import { expect, test } from "@playwright/test";

const enabled = process.env.RUN_E2E === "1";

const COMMONS = [
  "elara-venn",
  "rowan-vale",
  "mira-shellbright",
  "bram-ironroot",
  "tessa-windmere",
  "archivist-solen",
  "captain-orren",
  "nyla-brook",
  "pip-gearwhistle",
  "rook-emberfall",
];

test.describe("NPC assets HTTP", () => {
  test.skip(!enabled, "Set RUN_E2E=1 and start next server to run");

  for (const slug of COMMONS) {
    test(`portrait loads for ${slug}`, async ({ request }) => {
      const res = await request.get(
        `/assets/npcs/riftwild-commons/${slug}/portrait.png`,
      );
      expect(res.ok()).toBeTruthy();
      const buf = await res.body();
      expect(buf.byteLength).toBeGreaterThan(5000);
    });
  }

  test("regional guide portraits load", async ({ request }) => {
    const paths = [
      "/assets/npcs/ember-crater/kael-ashwalker/portrait.png",
      "/assets/npcs/moonwater-coast/luma-tidecrest/portrait.png",
      "/assets/npcs/elderwood-forest/warden-sylvi/portrait.png",
    ];
    for (const p of paths) {
      const res = await request.get(p);
      expect(res.ok(), p).toBeTruthy();
      expect((await res.body()).byteLength).toBeGreaterThan(5000);
    }
  });
});
