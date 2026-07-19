/**
 * Generate versioned card-stat overlays for ALL combat-capable cards.
 * Does NOT rewrite cards.json — writes migrations/card-stats-v2.json only.
 *
 *   node scripts/tcg/generate-card-stats-v2.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./content-sources.mjs";

const CARDS_PATH = path.join(ROOT, "src/content/tcg/data/cards.json");
const OUT_PATH = path.join(
  ROOT,
  "src/content/tcg/data/migrations/card-stats-v2.json",
);
const BACKUP_DIR = path.join(
  ROOT,
  "src/content/tcg/data/migrations/backups",
);

const UNIT_TYPES = new Set([
  "creature",
  "companion",
  "legendary",
  "token",
  "hero",
]);

/** Hand-authored identity templates (brief examples). */
const IDENTITY_TEMPLATES = {
  "rotr-c-bramblefox": {
    attack: 3,
    health: 5,
    defense: 1,
    speed: 7,
    role: "bruiser",
    keywords: ["bloom"],
    notes: "Brief Bramblefox — Nature skirmisher / Forest Bond.",
  },
  "rotr-c-mossprig": {
    attack: 2,
    health: 8,
    defense: 3,
    speed: 3,
    role: "tank",
    keywords: ["bloom", "guardian"],
    notes: "Brief Mossprig — Tank / Living Bulwark.",
  },
  "rotr-c-cinderquill": {
    attack: 1,
    health: 1,
    defense: 0,
    speed: 9,
    role: "assassin",
    keywords: ["charge"],
    notes: "Ember 1-drop Charge assassin.",
  },
  "rotr-c-emberfox": {
    attack: 2,
    health: 2,
    defense: 1,
    speed: 8,
    role: "assassin",
    keywords: ["charge"],
    notes: "Ember tempo Charge.",
  },
  "rotr-c-ashwing": {
    attack: 4,
    health: 3,
    defense: 1,
    speed: 7,
    role: "bruiser",
    keywords: ["flying"],
    notes: "Ember flyer — bypasses grounded Guardians.",
  },
};

const EQUIP_TYPES = new Set(["equipment", "relic", "artifact"]);
const TERRAIN_TYPES = new Set(["location", "weather"]);

function deriveRole(card) {
  const atk = card.attack ?? 0;
  const hp = card.health ?? 0;
  const kw = new Set((card.keywords ?? []).map((k) => String(k).toLowerCase()));
  if (kw.has("guardian") || kw.has("taunt") || kw.has("guard")) return "tank";
  if (kw.has("charge") && atk >= hp) return "assassin";
  if (kw.has("bloom") || kw.has("harmony") || kw.has("ward")) return "support";
  if (kw.has("heal")) return "healer";
  if (card.type === "token" || kw.has("summon")) return "swarm";
  if (hp >= atk + 3 && hp >= 5) return "defender";
  if (atk >= 6) return "finisher";
  if (card.energyCost <= 1 && atk <= 2) return "energy_generator";
  if (atk >= hp + 2) return "assassin";
  if (atk >= 3 && hp >= 4) return "bruiser";
  return "bruiser";
}

function deriveDefense(card, role) {
  if (typeof card.defense === "number") return clamp(card.defense, 0, 10);
  const hp = card.health ?? 1;
  let base = Math.round(hp * 0.4);
  if (role === "tank" || role === "defender") base += 2;
  if (role === "assassin") base = Math.max(0, base - 1);
  return clamp(base, 0, 10);
}

function deriveSpeed(card, role) {
  if (typeof card.speed === "number") return clamp(card.speed, 1, 10);
  let base = Math.max(1, 8 - (card.energyCost ?? 3));
  if (role === "assassin") base += 2;
  if (role === "tank" || role === "defender") base -= 1;
  if ((card.keywords ?? []).some((k) => String(k).toLowerCase() === "charge")) {
    base += 2;
  }
  if ((card.keywords ?? []).some((k) => String(k).toLowerCase() === "flying")) {
    base += 1;
  }
  return clamp(base, 1, 10);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function balanceBody(card, role) {
  const cost = clamp(card.energyCost ?? 1, 1, 10);
  let atk = clamp(card.attack ?? (UNIT_TYPES.has(card.type) ? 1 : 0), 0, 15);
  let hp = clamp(card.health ?? (UNIT_TYPES.has(card.type) ? 1 : 0), 1, 30);
  // Soft curve: ATK+HP ≈ 2*cost + 1 (± role)
  const target = cost * 2 + 1;
  const body = atk + hp;
  if (body > target + 3) {
    if (hp > atk) hp = Math.max(1, hp - 1);
    else atk = Math.max(0, atk - 1);
  } else if (body < target - 2 && UNIT_TYPES.has(card.type)) {
    if (role === "tank" || role === "defender") hp += 1;
    else atk += 1;
  }
  return {
    attack: clamp(atk, 0, 15),
    health: clamp(hp, 1, 30),
  };
}

function main() {
  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUP_DIR, `cards.json.${stamp}.bak`);
  fs.copyFileSync(CARDS_PATH, backupPath);

  const overlays = {};
  let unitCount = 0;

  for (const card of cards) {
    const isUnit = UNIT_TYPES.has(card.type);
    const isCombatSpell =
      card.type === "spell" &&
      (typeof card.attack === "number" ||
        (card.abilities ?? []).some((a) =>
          (a.effects ?? []).some((e) => e.op === "deal_damage" || e.op === "heal"),
        ));

    const isEquip = EQUIP_TYPES.has(card.type);
    const isTerrain = TERRAIN_TYPES.has(card.type);
    const isTrap = card.type === "trap";

    if (!isUnit && !isCombatSpell && !isEquip && !isTerrain && !isTrap) continue;

    if (IDENTITY_TEMPLATES[card.id]) {
      overlays[card.id] = { ...IDENTITY_TEMPLATES[card.id] };
      unitCount += 1;
      continue;
    }

    if (isUnit) {
      const role = deriveRole(card);
      const body = balanceBody(card, role);
      const defense = deriveDefense({ ...card, ...body }, role);
      const speed = deriveSpeed({ ...card, ...body }, role);
      overlays[card.id] = {
        attack: body.attack,
        health: body.health,
        defense,
        speed,
        role,
        keywords: card.keywords ?? [],
      };
      unitCount += 1;
    } else if (isEquip) {
      const cost = clamp(card.energyCost ?? 2, 0, 10);
      overlays[card.id] = {
        attack: Math.max(0, Math.floor((cost + 1) / 2)),
        defense: Math.max(0, Math.floor(cost / 2)),
        health: 0,
        speed: 0,
        role: "support",
        keywords: card.keywords ?? [],
        notes: "Equipment attach mods (ATK/DEF) — not unit body stats.",
      };
    } else if (isTerrain || isTrap) {
      overlays[card.id] = {
        role: "utility",
        speed: clamp(4, 1, 10),
        defense: 0,
        keywords: card.keywords ?? [],
        notes: isTrap ? "Trap layout metadata." : "Terrain global effect metadata.",
      };
    } else {
      // Spells keep cost; stamp role for analytics
      const role =
        (card.abilities ?? []).some((a) =>
          (a.effects ?? []).some((e) => e.op === "heal"),
        )
          ? "healer"
          : (card.attack ?? 0) >= 5
            ? "finisher"
            : "controller";
      overlays[card.id] = {
        role,
        speed: clamp(6 - Math.floor((card.energyCost ?? 3) / 2), 1, 10),
        defense: 0,
        keywords: card.keywords ?? [],
      };
    }
  }

  // Brief Thornling identity (1-cost swarm / Bloom)
  const thorn = cards.find(
    (c) => c.id.includes("thornling") || c.riftlingSlug === "thornling",
  );
  if (thorn) {
    overlays[thorn.id] = {
      attack: 1,
      health: 3,
      defense: 0,
      speed: 6,
      role: "swarm",
      keywords: ["bloom"],
      notes: "Brief Thornling — Sprouting Energy / Bloom.",
    };
  }

  const bundle = {
    version: 2,
    schema: "riftwilds.tcg.card-stats.v2",
    generatedAt: new Date().toISOString(),
    description:
      "Versioned combat stats for all units + combat spells. Merged at load; cards.json untouched.",
    competitiveMode: "base_stats_only",
    overlayCount: Object.keys(overlays).length,
    unitOverlays: unitCount,
    cardsBackup: path.relative(ROOT, backupPath).replace(/\\/g, "/"),
    overlays,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(bundle, null, 2) + "\n", "utf8");
  console.log(
    `Wrote ${Object.keys(overlays).length} overlays → ${path.relative(ROOT, OUT_PATH)}`,
  );
  console.log(`Backup: ${path.relative(ROOT, backupPath)}`);
}

main();
