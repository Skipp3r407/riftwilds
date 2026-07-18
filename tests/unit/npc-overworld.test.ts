import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  COMMONS_OVERWORLD_NPC_SLUGS,
  isMovingNpcBehavior,
  npcWanderAmplitude,
} from "@/game/live-world/npcs/overworld-npcs";

const ROOT = process.cwd();

describe("Commons overworld NPC sheets", () => {
  it("every Commons blueprint NPC has a transparent overworld sheet", () => {
    const missing: string[] = [];
    for (const slug of COMMONS_OVERWORLD_NPC_SLUGS) {
      const sheet = path.join(
        ROOT,
        "public/assets/npcs/riftwild-commons",
        slug,
        "overworld-sheet.png",
      );
      if (!fs.existsSync(sheet) || fs.statSync(sheet).size < 2000) {
        missing.push(slug);
      }
    }
    expect(missing).toEqual([]);
  });

  it("maps patrol / look_around to wander and idle roots to low or zero amp", () => {
    expect(isMovingNpcBehavior("patrol")).toBe(true);
    expect(npcWanderAmplitude("patrol")).toBeGreaterThan(20);
    expect(isMovingNpcBehavior("look_around")).toBe(true);
    // Idle keeps a subtle shuffle so Commons NPCs are never frozen
    expect(npcWanderAmplitude("idle")).toBeGreaterThan(0);
    expect(npcWanderAmplitude("read")).toBeGreaterThan(0);
  });
});
