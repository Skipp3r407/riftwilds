/**
 * Day/night lighting, weather particles, fog, fireflies, cloud shadows.
 * Art direction: warm Ultima day, Diablo torch night, Zelda readability.
 * Ambient-first — light gameplay impact only (visibility tint).
 */

import * as Phaser from "phaser";
import { loadImmersiveSettings } from "@/game/live-world/systems/immersive/settings";
import { resolveParticleEmitScale } from "@/game/live-world/systems/immersive/performance";

export type WeatherKind = "clear" | "rain" | "fog" | "wind" | "ash";

export type AtmosphereState = {
  /** 0 night → 1 day */
  dayFactor: number;
  weather: WeatherKind;
};

export type AtmosphereHandles = {
  overlay: Phaser.GameObjects.Rectangle;
  torchLights: Phaser.GameObjects.Arc[];
  particles: Phaser.GameObjects.Particles.ParticleEmitter[];
  cloudShadows: Phaser.GameObjects.Ellipse[];
  waterShimmer: Phaser.GameObjects.Ellipse[];
  update: (time: number, camera: Phaser.Cameras.Scene2D.Camera) => AtmosphereState;
  destroy: () => void;
};

const DAY_CYCLE_MS = 8 * 60 * 1000; // 8 minute day for hub feel

function weatherForRegion(regionSlug: string, dayFactor: number): WeatherKind {
  // Deterministic soft weather windows
  const slot = Math.floor(Date.now() / (3 * 60 * 1000)) % 7;
  if (regionSlug === "riftwild-commons") {
    if (slot === 2) return "rain";
    if (slot === 4) return dayFactor < 0.35 ? "fog" : "wind";
    return "clear";
  }
  if (regionSlug.includes("ember") || regionSlug.includes("void")) {
    return slot % 3 === 0 ? "ash" : "clear";
  }
  return slot === 1 ? "fog" : "clear";
}

export function createAtmosphere(
  scene: Phaser.Scene,
  regionSlug: string,
  mapW: number,
  mapH: number,
): AtmosphereHandles {
  const overlay = scene.add
    .rectangle(mapW / 2, mapH / 2, mapW * 1.2, mapH * 1.2, 0x1a1410, 0)
    .setDepth(40)
    .setScrollFactor(1);

  const torchLights: Phaser.GameObjects.Arc[] = [];
  const T = 32;
  const torchSpots =
    regionSlug === "riftwild-commons"
      ? [
          { x: 28 * T, y: 20 * T, color: 0xffc070, r: 52 },
          { x: 36 * T, y: 24 * T, color: 0xffc070, r: 48 },
          { x: 10 * T, y: 38 * T, color: 0xffaa55, r: 56 }, // market
          { x: 12 * T, y: 36 * T, color: 0xffb060, r: 40 },
          { x: 8 * T, y: 22 * T, color: 0xff8844, r: 50 }, // forge
          { x: 32 * T, y: 7 * T, color: 0x66e0ff, r: 54 }, // portal
          { x: 29 * T, y: 9 * T, color: 0x66e0ff, r: 42 },
          { x: 9 * T, y: 8 * T, color: 0xa0d0ff, r: 46 }, // hatchery
          { x: 52 * T, y: 38 * T, color: 0xe8c070, r: 48 }, // guild — gold, not purple
          { x: 42 * T, y: 15 * T, color: 0xffc070, r: 36 }, // library path
          { x: 48 * T, y: 12 * T, color: 0xffb060, r: 38 }, // watchtower
          { x: 14 * T, y: 10 * T, color: 0xffb060, r: 36 },
        ]
      : [];

  for (const t of torchSpots) {
    const glow = scene.add.circle(t.x, t.y, t.r, t.color, 0.16);
    glow.setDepth(39);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    torchLights.push(glow);
    scene.tweens.add({
      targets: glow,
      alpha: { from: 0.12, to: 0.26 },
      scale: { from: 0.94, to: 1.1 },
      duration: 700 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
    });
  }

  const particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  let particleDensity = 1;
  let lastParticlePrefAt = -9999;

  // Fireflies (night / dusk) — warm meadow gold + soft green
  ensureSoftParticle(scene);
  const fireflies = scene.add.particles(0, 0, "pw-particle-soft", {
    x: { min: 0, max: mapW },
    y: { min: 0, max: mapH },
    lifespan: 3200,
    speed: { min: 4, max: 18 },
    scale: { start: 0.35, end: 0 },
    alpha: { start: 0.7, end: 0 },
    tint: [0xc8ff90, 0xffe08a, 0x9bffd0],
    frequency: 180,
    blendMode: "ADD",
    emitting: false,
  });
  fireflies.setDepth(38);
  particles.push(fireflies);

  // Rain
  const rain = scene.add.particles(0, 0, "pw-particle-soft", {
    x: { min: 0, max: mapW },
    y: { min: -20, max: 0 },
    lifespan: 900,
    speedY: { min: 280, max: 420 },
    speedX: { min: -40, max: -10 },
    scale: { start: 0.15, end: 0.05 },
    alpha: { start: 0.35, end: 0.05 },
    tint: 0xa8c8e8,
    frequency: 16,
    quantity: 2,
    emitting: false,
  });
  rain.setDepth(41);
  particles.push(rain);

  // Ash / wind motes — warm dust
  const wind = scene.add.particles(0, 0, "pw-particle-soft", {
    x: { min: -20, max: mapW },
    y: { min: 0, max: mapH },
    lifespan: 2400,
    speedX: { min: 30, max: 90 },
    speedY: { min: -10, max: 10 },
    scale: { start: 0.2, end: 0 },
    alpha: { start: 0.25, end: 0 },
    tint: [0xd8c8a0, 0xa09080],
    frequency: 80,
    emitting: false,
  });
  wind.setDepth(37);
  particles.push(wind);

  const cloudShadows: Phaser.GameObjects.Ellipse[] = [];
  for (let i = 0; i < 5; i++) {
    const c = scene.add.ellipse(
      200 + i * 360,
      160 + (i % 2) * 240,
      240,
      96,
      0x1a1810,
      0.09,
    );
    c.setDepth(2);
    cloudShadows.push(c);
  }

  // Soft water caustic shimmer (Commons fishing pond / stream) — few ellipses, LOD-cheap
  const waterShimmer: Phaser.GameObjects.Ellipse[] = [];
  if (regionSlug === "riftwild-commons") {
    const pondSpots = [
      { x: 28 * T, y: 40 * T },
      { x: 26 * T, y: 38 * T },
      { x: 30 * T, y: 41 * T },
    ];
    for (let i = 0; i < pondSpots.length; i++) {
      const p = pondSpots[i]!;
      const e = scene.add.ellipse(p.x, p.y, 70 + i * 12, 36 + i * 6, 0x7ad4ff, 0.07);
      e.setDepth(1.2);
      e.setBlendMode(Phaser.BlendModes.ADD);
      waterShimmer.push(e);
      scene.tweens.add({
        targets: e,
        alpha: { from: 0.04, to: 0.12 },
        scaleX: { from: 0.92, to: 1.08 },
        scaleY: { from: 1.05, to: 0.9 },
        duration: 1600 + i * 280,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  const update = (time: number, _camera: Phaser.Cameras.Scene2D.Camera): AtmosphereState => {
    const cycle = (time % DAY_CYCLE_MS) / DAY_CYCLE_MS;
    // Smooth day curve: bright midday, soft night
    const dayFactor = 0.35 + 0.65 * Math.sin(cycle * Math.PI);
    const weather = weatherForRegion(regionSlug, dayFactor);

    // Night + dusk recipe (warm Ultima day → cool navy night + hearth)
    const nightAlpha = (1 - dayFactor) * 0.42;
    let tint = 0x121a28;
    let extra = 0;
    if (dayFactor > 0.75) {
      // Midday: slight golden wash, not grey
      tint = 0x2a2418;
      extra = 0.04;
    } else if (dayFactor > 0.55) {
      // Late afternoon gold
      tint = 0x3a2820;
      extra = 0.06;
    }
    if (weather === "rain") {
      tint = 0x152030;
      extra += 0.12;
    } else if (weather === "fog") {
      tint = 0x304050;
      extra += 0.16;
    } else if (weather === "ash") {
      tint = 0x281810;
      extra += 0.1;
    } else if (weather === "wind") {
      tint = dayFactor < 0.5 ? 0x1a2018 : 0x2a2818;
      extra += 0.04;
    }
    overlay.setFillStyle(tint, Math.min(0.58, nightAlpha + extra));

    // Torch intensity at dusk/night
    for (const g of torchLights) {
      g.setVisible(dayFactor < 0.58);
    }

    // Hide caustics in heavy fog (tween owns alpha otherwise)
    for (const w of waterShimmer) {
      w.setVisible(weather !== "fog" && dayFactor > 0.28);
    }

    const [firefliesEm, rainEm, windEm] = particles;
    // Immersive particle budget — refresh prefs ~2s so we don't hit localStorage every frame.
    if (time - lastParticlePrefAt > 2000) {
      particleDensity = resolveParticleEmitScale(loadImmersiveSettings()).density;
      lastParticlePrefAt = time;
    }
    const wantFire = particleDensity > 0.3 && dayFactor < 0.42 && weather !== "rain";
    const wantRain = particleDensity > 0.2 && weather === "rain";
    const wantWind = particleDensity > 0.2 && (weather === "wind" || weather === "ash");
    if (firefliesEm) firefliesEm.emitting = wantFire;
    if (rainEm) rainEm.emitting = wantRain;
    if (windEm) windEm.emitting = wantWind;

    // Drift cloud shadows
    for (let i = 0; i < cloudShadows.length; i++) {
      const c = cloudShadows[i]!;
      c.x = ((time * 0.012 + i * 380) % (mapW + 240)) - 120;
      c.setAlpha(weather === "clear" ? 0.08 : 0.03);
    }

    return { dayFactor, weather };
  };

  return {
    overlay,
    torchLights,
    particles,
    cloudShadows,
    waterShimmer,
    update,
    destroy: () => {
      overlay.destroy();
      torchLights.forEach((t) => t.destroy());
      particles.forEach((p) => p.destroy());
      cloudShadows.forEach((c) => c.destroy());
      waterShimmer.forEach((w) => w.destroy());
    },
  };
}

function ensureSoftParticle(scene: Phaser.Scene): void {
  if (scene.textures.exists("pw-particle-soft")) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffffff, 1);
  g.fillCircle(8, 8, 8);
  g.generateTexture("pw-particle-soft", 16, 16);
  g.destroy();
}
