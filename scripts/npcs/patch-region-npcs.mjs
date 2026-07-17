import fs from "node:fs";

const p = "src/game/world-maps/blueprints/region-factory.ts";
let s = fs.readFileSync(p, "utf8");

const fills = {
  "stormspire-peaks": `npcIds: [
      { id: "aeron-cloudstep", col: 10, row: 20 },
      { id: "engineer-volt", col: 18, row: 16 },
      { id: "skywarden-ilya", col: 22, row: 12 },
      { id: "hermit-thane", col: 8, row: 28 },
      { id: "storm-porter-zee", col: 9, row: 18 },
      { id: "storm-cook-pip2", col: 11, row: 19 },
      { id: "storm-climber-aro", col: 14, row: 15 },
      { id: "storm-guard-nimbus", col: 12, row: 14 },
    ]`,
  "stoneheart-canyon": `npcIds: [
      { id: "doran-flint", col: 10, row: 18 },
      { id: "petra-stoneveil", col: 20, row: 22 },
      { id: "marshal-korr", col: 8, row: 12 },
      { id: "gemwright-opal", col: 16, row: 14 },
      { id: "stone-hauler-mog", col: 11, row: 16 },
      { id: "stone-cook-peb", col: 9, row: 14 },
      { id: "stone-survey-lin", col: 15, row: 18 },
      { id: "stone-guard-slab", col: 7, row: 13 },
    ]`,
  "frostveil-basin": `npcIds: [
      { id: "freya-snowmark", col: 10, row: 16 },
      { id: "jori-icebloom", col: 16, row: 18 },
      { id: "hunter-varek", col: 22, row: 20 },
      { id: "aurora-linn", col: 18, row: 12 },
      { id: "frost-porter-yul", col: 9, row: 15 },
      { id: "frost-knitter-esa", col: 12, row: 17 },
      { id: "frost-scout-rin", col: 14, row: 15 },
      { id: "frost-guard-ice", col: 8, row: 14 },
    ]`,
  "radiant-citadel": `npcIds: [
      { id: "chancellor-aurex", col: 16, row: 16 },
      { id: "scholar-lyra", col: 20, row: 14 },
      { id: "sentinel-cassian", col: 10, row: 18 },
      { id: "curator-verin", col: 24, row: 16 },
      { id: "citadel-scribe-omi", col: 15, row: 15 },
      { id: "citadel-vendor-lux", col: 18, row: 17 },
      { id: "citadel-acolyte-ven", col: 19, row: 15 },
      { id: "citadel-guard-halo", col: 11, row: 17 },
    ]`,
  "void-hollow": `npcIds: [
      { id: "shadecaller-neris", col: 10, row: 14 },
      { id: "watcher-omen", col: 18, row: 12 },
      { id: "veya-dusk", col: 14, row: 18 },
      { id: "keeper-null", col: 22, row: 20 },
      { id: "void-porter-dim", col: 9, row: 15 },
      { id: "void-scribe-umbra", col: 12, row: 16 },
      { id: "void-scout-gloom", col: 15, row: 15 },
      { id: "void-guard-veil", col: 11, row: 13 },
    ]`,
  "alloy-ruins": `npcIds: [
      { id: "tinker-pax", col: 12, row: 16 },
      { id: "unit-ari-7", col: 18, row: 18 },
      { id: "salvager-knox", col: 10, row: 20 },
      { id: "professor-ferrum", col: 22, row: 14 },
      { id: "alloy-porter-cog", col: 11, row: 17 },
      { id: "alloy-welder-spark", col: 14, row: 16 },
      { id: "alloy-runner-bit", col: 16, row: 15 },
      { id: "alloy-guard-bolt", col: 9, row: 18 },
    ]`,
  "spirit-marsh": `npcIds: [
      { id: "medium-amara", col: 12, row: 16 },
      { id: "ferryman-grey", col: 8, row: 20 },
      { id: "lantern-keeper-sio", col: 16, row: 14 },
      { id: "echo-child-nimi", col: 20, row: 22 },
      { id: "marsh-porter-reed", col: 10, row: 17 },
      { id: "marsh-singer-fog", col: 14, row: 15 },
      { id: "marsh-herbal-mist", col: 15, row: 18 },
      { id: "marsh-guard-wick", col: 9, row: 16 },
    ]`,
  "celestial-rift": `npcIds: [
      { id: "astronomer-caelis", col: 14, row: 16 },
      { id: "guardian-seraphine", col: 20, row: 12 },
      { id: "starforger-orion", col: 16, row: 20 },
      { id: "nameless-witness", col: 24, row: 18 },
      { id: "celestial-acolyte-nova", col: 13, row: 15 },
      { id: "celestial-scribe-astro", col: 15, row: 17 },
      { id: "celestial-porter-orbit", col: 17, row: 16 },
      { id: "celestial-guard-lumen", col: 19, row: 13 },
    ]`,
};

for (const [region, fill] of Object.entries(fills)) {
  const re = new RegExp(`("${region}":\\s*\\{[\\s\\S]*?)npcIds: \\[\\],`);
  if (!re.test(s)) {
    console.log("MISS", region);
    continue;
  }
  s = s.replace(re, (_, pre) => `${pre}${fill},`);
  console.log("OK", region);
}

fs.writeFileSync(p, s);
