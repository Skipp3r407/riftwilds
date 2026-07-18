/**
 * Riftwilds comic-cinematic commercials — panel zooms + music bed + VO (ducked).
 * Style: colorful graphic-novel panels (navy/cyan/amber + affinity) + dynamic comic motion.
 * Features catalog Riftlings (Glowpup, Cindercub, etc.). Original IP only.
 *
 * Usage: node scripts/commercials/build-commercials.mjs
 * Optional: FFMPEG_PATH / FFPROBE_PATH env overrides.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const comicDir = path.join(root, "public/assets/commercials/storyboards/comic");
const videoOut = path.join(root, "public/assets/commercials/video");
const audioOut = path.join(root, "public/assets/commercials/audio");
const musicDir = path.join(root, "public/sounds/music");
const tmp = path.join(root, "artifacts/commercials/tmp");

fs.mkdirSync(videoOut, { recursive: true });
fs.mkdirSync(audioOut, { recursive: true });
fs.mkdirSync(tmp, { recursive: true });

function resolveBin(name, envKey, fallbacks) {
  if (process.env[envKey] && fs.existsSync(process.env[envKey])) {
    return process.env[envKey];
  }
  const which = spawnSync(process.platform === "win32" ? "where.exe" : "which", [name], {
    encoding: "utf8",
  });
  if (which.status === 0) {
    const first = String(which.stdout)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find(Boolean);
    if (first && fs.existsSync(first)) return first;
  }
  for (const f of fallbacks) {
    if (fs.existsSync(f)) return f;
  }
  throw new Error(`${name} not found. Set ${envKey} or install ffmpeg.`);
}

const FFMPEG = resolveBin("ffmpeg", "FFMPEG_PATH", [
  "C:\\Program Files\\Jellyfin\\Server\\ffmpeg.exe",
]);
const FFPROBE = resolveBin("ffprobe", "FFPROBE_PATH", [
  "C:\\Program Files\\Jellyfin\\Server\\ffprobe.exe",
  path.join(path.dirname(FFMPEG), "ffprobe.exe"),
]);

console.log(`ffmpeg: ${FFMPEG}`);

function ff(...args) {
  const r = spawnSync(FFMPEG, ["-y", ...args], {
    encoding: "utf8",
    maxBuffer: 40 * 1024 * 1024,
  });
  if (r.status !== 0) {
    console.error(r.stderr?.slice(-2500));
    throw new Error(`ffmpeg failed: ${args.slice(0, 6).join(" ")}`);
  }
  return r;
}

function probeDuration(file) {
  const r = spawnSync(
    FFPROBE,
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  );
  return Number.parseFloat(String(r.stdout).trim()) || 0;
}

/**
 * Comic panel motion: zoom into a focus region (panel storytelling),
 * optional ink flash (brief white/black pulse via fade).
 * focus: { x, y } as 0–1 relative pan target for zoompan.
 */
function comicClip(input, output, { w, h, duration, zoom = 1.28, focus = "center", flash = false }) {
  const frames = Math.max(1, Math.round(duration * 30));
  const zExpr = `'min(zoom+0.0011,${zoom})'`;

  let xExpr = "'(iw-iw/zoom)/2'";
  let yExpr = "'(ih-ih/zoom)/2'";
  if (focus === "left") xExpr = "'(iw-iw/zoom)*0.15'";
  if (focus === "right") xExpr = "'(iw-iw/zoom)*0.85'";
  if (focus === "top") yExpr = "'(ih-ih/zoom)*0.12'";
  if (focus === "bottom") yExpr = "'(ih-ih/zoom)*0.88'";
  if (focus === "ul") {
    xExpr = "'(iw-iw/zoom)*0.12'";
    yExpr = "'(ih-ih/zoom)*0.12'";
  }
  if (focus === "ur") {
    xExpr = "'(iw-iw/zoom)*0.88'";
    yExpr = "'(ih-ih/zoom)*0.12'";
  }
  if (focus === "ll") {
    xExpr = "'(iw-iw/zoom)*0.12'";
    yExpr = "'(ih-ih/zoom)*0.88'";
  }
  if (focus === "lr") {
    xExpr = "'(iw-iw/zoom)*0.88'";
    yExpr = "'(ih-ih/zoom)*0.88'";
  }
  if (focus === "sweep-right") {
    xExpr = "'(iw-iw/zoom)*(on/" + frames + ")'";
  }
  if (focus === "sweep-down") {
    yExpr = "'(ih-ih/zoom)*(on/" + frames + ")'";
  }

  // Soft vignette + slight contrast for ink punch; optional flash via fade
  const fade = flash
    ? `,fade=t=in:st=0:d=0.12:color=black,fade=t=out:st=${Math.max(0, duration - 0.14)}:d=0.14:color=black`
    : `,fade=t=in:st=0:d=0.08:color=black,fade=t=out:st=${Math.max(0, duration - 0.1)}:d=0.1:color=black`;

  ff(
    "-loop",
    "1",
    "-i",
    input,
    "-vf",
    `scale=${w * 2}:${h * 2}:force_original_aspect_ratio=increase,crop=${w * 2}:${h * 2},zoompan=z=${zExpr}:x=${xExpr}:y=${yExpr}:d=${frames}:s=${w}x${h}:fps=30,eq=contrast=1.08:saturation=1.18:brightness=0.01${fade},format=yuv420p`,
    "-t",
    String(duration),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-an",
    output,
  );
}

function concatList(files, listPath) {
  const body = files.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n");
  fs.writeFileSync(listPath, body, "utf8");
}

function concatVideos(files, output) {
  const listPath = path.join(tmp, `concat-${path.basename(output)}.txt`);
  concatList(files, listPath);
  ff("-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", output);
}

function bedAudio(musicSrc, duration, outPath, { fadeIn = 0.6, fadeOut = 1.4, vol = 0.18 } = {}) {
  // High-pass the bed so space pads don't mask the narrator with low rumble.
  ff(
    "-stream_loop",
    "-1",
    "-i",
    musicSrc,
    "-t",
    String(duration),
    "-af",
    `highpass=f=90,lowpass=f=12000,volume=${vol},afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${Math.max(0, duration - fadeOut)}:d=${fadeOut}`,
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    outPath,
  );
}

/** Mix music bed under VO with sidechain ducking when VO exists */
function mixBedAndVo(bedPath, voPath, duration, outPath) {
  if (!voPath || !fs.existsSync(voPath)) {
    fs.copyFileSync(bedPath, outPath);
    return;
  }
  // music ducks hard under VO; narrator sits clearly forward
  ff(
    "-i",
    bedPath,
    "-i",
    voPath,
    "-filter_complex",
    `[0:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,volume=0.85[music];` +
      `[1:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,highpass=f=90,volume=1.35,apad=whole_dur=${duration}[vo];` +
      `[music][vo]sidechaincompress=threshold=0.025:ratio=10:attack=25:release=500:makeup=1.0[ducked];` +
      `[ducked][vo]amix=inputs=2:duration=first:dropout_transition=0,alimiter=limit=0.95,volume=1.0[a]`,
    "-map",
    "[a]",
    "-t",
    String(duration),
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    outPath,
  );
}

function mux(video, audio, output) {
  ff(
    "-i",
    video,
    "-i",
    audio,
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-shortest",
    "-movflags",
    "+faststart",
    output,
  );
}

function comicPath(file) {
  const p = path.join(comicDir, file);
  if (!fs.existsSync(p)) throw new Error(`Missing comic frame: ${p}`);
  return p;
}

function buildSequence(name, shots, { w, h, music, vo = null, mute = false }) {
  console.log(`Building ${name} (${w}x${h}) comic cinematic…`);
  const clips = [];
  let total = 0;
  shots.forEach((shot, i) => {
    const clip = path.join(tmp, `${name}-${String(i).padStart(2, "0")}.mp4`);
    comicClip(comicPath(shot.file), clip, {
      w,
      h,
      duration: shot.duration,
      zoom: shot.zoom ?? 1.32,
      focus: shot.focus ?? "center",
      flash: shot.flash ?? i > 0,
    });
    clips.push(clip);
    total += shot.duration;
  });
  const silent = path.join(tmp, `${name}-silent.mp4`);
  concatVideos(clips, silent);
  const finalPath = path.join(videoOut, `${name}.mp4`);
  if (mute) {
    ff("-i", silent, "-c:v", "copy", "-an", "-movflags", "+faststart", finalPath);
  } else {
    const bed = path.join(audioOut, `${name}-bed.m4a`);
    bedAudio(music, total, bed);
    const mix = path.join(audioOut, `${name}-mix.m4a`);
    const voPath = vo && fs.existsSync(vo) ? vo : null;
    if (voPath) {
      console.log(`  mixing VO + ducked music…`);
      mixBedAndVo(bed, voPath, total, mix);
      mux(silent, mix, finalPath);
    } else {
      console.log(`  (no VO file — music bed only)`);
      mux(silent, bed, finalPath);
    }
  }
  const dur = probeDuration(finalPath);
  console.log(`  → ${finalPath} (${dur.toFixed(1)}s)`);
  return { path: finalPath, duration: dur, hasVo: Boolean(vo && fs.existsSync(vo)) };
}

const musicMagic = path.join(musicDir, "magic-space.mp3");
const musicAiry = path.join(musicDir, "airy.mp3");
const musicSector = path.join(musicDir, "sector.mp3");

for (const f of ["magic-space.mp3", "airy.mp3", "sector.mp3", "pulse.mp3"]) {
  const src = path.join(musicDir, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(audioOut, f));
}

// Comic sequences — panel zooms / page energy (not flat Ken Burns slideshow)
const cinematic60 = [
  { file: "comic-01-rift-splash.png", duration: 7, focus: "center", zoom: 1.35 },
  { file: "comic-02-hatch-panels.png", duration: 5.5, focus: "ul", zoom: 1.4, flash: true },
  { file: "comic-02-hatch-panels.png", duration: 5.5, focus: "lr", zoom: 1.38 },
  { file: "comic-04-liveworld-page.png", duration: 6.5, focus: "sweep-right", zoom: 1.3 },
  { file: "comic-04-liveworld-page.png", duration: 5, focus: "ll", zoom: 1.42, flash: true },
  { file: "comic-03-battle-action.png", duration: 5, focus: "center", zoom: 1.45 },
  { file: "comic-04-liveworld-page.png", duration: 4, focus: "ur", zoom: 1.4, flash: true },
  { file: "comic-04-liveworld-page.png", duration: 4, focus: "lr", zoom: 1.38 },
  { file: "comic-03-battle-action.png", duration: 5, focus: "sweep-down", zoom: 1.28, flash: true },
  { file: "comic-01-rift-splash.png", duration: 5, focus: "right", zoom: 1.32 },
  { file: "comic-05-endcard-egg.png", duration: 7.5, focus: "center", zoom: 1.18, flash: true },
];

const social30 = [
  { file: "comic-v01-vertical-poster.png", duration: 5, focus: "center", zoom: 1.35 },
  { file: "comic-v02-hatch-vertical.png", duration: 5, focus: "sweep-down", zoom: 1.32, flash: true },
  { file: "comic-v03-explore-vertical.png", duration: 5, focus: "center", zoom: 1.38 },
  { file: "comic-03-battle-action.png", duration: 5, focus: "center", zoom: 1.4, flash: true },
  { file: "comic-04-liveworld-page.png", duration: 5, focus: "sweep-right", zoom: 1.3 },
  { file: "comic-05-endcard-egg.png", duration: 5, focus: "center", zoom: 1.16, flash: true },
];

const teaser15 = [
  { file: "comic-v01-vertical-poster.png", duration: 4, focus: "center", zoom: 1.4, flash: true },
  { file: "comic-v02-hatch-vertical.png", duration: 4, focus: "sweep-down", zoom: 1.35 },
  { file: "comic-v03-explore-vertical.png", duration: 3.5, focus: "center", zoom: 1.38, flash: true },
  { file: "comic-05-endcard-egg.png", duration: 3.5, focus: "center", zoom: 1.15 },
];

const square25 = [
  { file: "comic-s01-square-hero.png", duration: 5, focus: "center", zoom: 1.4 },
  { file: "comic-02-hatch-panels.png", duration: 5, focus: "lr", zoom: 1.42, flash: true },
  { file: "comic-03-battle-action.png", duration: 5, focus: "center", zoom: 1.45 },
  { file: "comic-04-liveworld-page.png", duration: 5, focus: "sweep-right", zoom: 1.32, flash: true },
  { file: "comic-05-endcard-egg.png", duration: 5, focus: "center", zoom: 1.16 },
];

const header12 = [
  { file: "comic-01-rift-splash.png", duration: 6, focus: "sweep-right", zoom: 1.22 },
  { file: "comic-01-rift-splash.png", duration: 6, focus: "left", zoom: 1.2 },
];

const vo60 = path.join(audioOut, "riftwilds-commercial-60s-16x9-vo.m4a");
const vo30 = path.join(audioOut, "riftwilds-commercial-30s-9x16-vo.m4a");
const vo15 = path.join(audioOut, "riftwilds-commercial-15s-9x16-teaser-vo.m4a");
const vo25 = path.join(audioOut, "riftwilds-commercial-25s-1x1-vo.m4a");

const results = [];
results.push(
  buildSequence("riftwilds-commercial-60s-16x9", cinematic60, {
    w: 1920,
    h: 1080,
    music: musicMagic,
    vo: vo60,
  }),
);
results.push(
  buildSequence("riftwilds-commercial-30s-9x16", social30, {
    w: 1080,
    h: 1920,
    music: musicAiry,
    vo: vo30,
  }),
);
results.push(
  buildSequence("riftwilds-commercial-15s-9x16-teaser", teaser15, {
    w: 1080,
    h: 1920,
    music: musicSector,
    vo: vo15,
  }),
);
results.push(
  buildSequence("riftwilds-commercial-25s-1x1", square25, {
    w: 1080,
    h: 1080,
    music: musicAiry,
    vo: vo25,
  }),
);
results.push(
  buildSequence("riftwilds-header-loop-12s-16x9-muted", header12, {
    w: 1920,
    h: 1080,
    music: musicMagic,
    mute: true,
  }),
);

fs.writeFileSync(
  path.join(root, "artifacts/commercials/build-summary.json"),
  JSON.stringify(
    {
      builtAt: new Date().toISOString(),
      style: "comic-cinematic-colorful",
      speciesFeatured: [
        "Glowpup",
        "Cindercub",
        "Mossprig",
        "Bubbloon",
        "Voltkit",
        "Riftpup",
        "Luminara",
        "Gearling",
        "Wisplet",
      ],
      ffmpeg: FFMPEG,
      results,
    },
    null,
    2,
  ),
);
console.log("Done.");
