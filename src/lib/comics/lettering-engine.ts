/**
 * Programmatic comic lettering — balloons, captions, SFX with safe margins.
 * Used by bake scripts; fonts must live outside /public.
 */

export type LetterKind =
  | "speech"
  | "thought"
  | "narration"
  | "whisper"
  | "shout"
  | "magic"
  | "telepathy"
  | "creature"
  | "sfx"
  | "caption";

export type LetterBubble = {
  kind: LetterKind;
  speaker?: string | null;
  text: string;
  /** Center X % 0–100 */
  x: number;
  /** Center Y % 0–100 */
  y: number;
  tail?: string;
  maxWidthPct?: number;
};

export type LetteringPageInput = {
  width: number;
  height: number;
  title?: string | null;
  caption?: string | null;
  loreSidebar?: { title: string; body: string } | null;
  bubbles: LetterBubble[];
  /** Margin as fraction of min(width,height) */
  safeMarginPct?: number;
};

export type PlacedBox = {
  kind: LetterKind;
  x: number;
  y: number;
  w: number;
  h: number;
  speaker?: string | null;
  lines: string[];
  tail?: string;
};

const MARGIN_DEFAULT = 0.035;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function wrapWords(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function overlaps(a: PlacedBox, b: PlacedBox, pad: number): boolean {
  return !(
    a.x + a.w + pad < b.x ||
    b.x + b.w + pad < a.x ||
    a.y + a.h + pad < b.y ||
    b.y + b.h + pad < a.y
  );
}

function clampBox(box: PlacedBox, W: number, H: number, margin: number): PlacedBox {
  let { x, y, w, h } = box;
  x = Math.max(margin, Math.min(W - margin - w, x));
  y = Math.max(margin, Math.min(H - margin - h, y));
  return { ...box, x, y, w, h };
}

/** Resolve bubble % positions into pixel boxes with collision nudging. */
export function layoutLettering(input: LetteringPageInput): PlacedBox[] {
  const W = input.width;
  const H = input.height;
  const margin = Math.round(Math.min(W, H) * (input.safeMarginPct ?? MARGIN_DEFAULT));
  const placed: PlacedBox[] = [];
  const pad = 10;

  if (input.title) {
    const lines = wrapWords(input.title, 26);
    const h = 28 + lines.length * 40;
    placed.push({
      kind: "caption",
      x: margin,
      y: margin,
      w: Math.min(W - margin * 2, 720),
      h,
      lines,
    });
  }

  for (const b of input.bubbles) {
    if (!b.text?.trim()) continue;
    const maxW = Math.round((W * (b.maxWidthPct ?? (b.kind === "sfx" ? 55 : 34))) / 100);
    const isBanner = b.kind === "narration" || b.kind === "caption";
    const isSfx = b.kind === "sfx";
    const fontChars = isSfx ? 16 : isBanner ? 40 : 28;
    const lines = wrapWords(
      isSfx ? b.text.toUpperCase() : b.text,
      fontChars,
    );
    const lineH = isSfx ? 46 : isBanner ? 30 : 28;
    const speakerH = b.speaker && !isBanner && !isSfx ? 20 : 0;
    const padY = isSfx ? 8 : 16;
    const w = isSfx
      ? Math.min(maxW, 20 + Math.max(...lines.map((l) => l.length)) * 22)
      : Math.min(maxW, isBanner ? 640 : 400);
    const h = padY * 2 + speakerH + lines.length * lineH;
    const cx = (b.x / 100) * W;
    const cy = (b.y / 100) * H;
    let box: PlacedBox = {
      kind: b.kind,
      x: cx - w / 2,
      y: cy - h / 2,
      w,
      h,
      speaker: b.speaker,
      lines,
      tail: b.tail,
    };
    box = clampBox(box, W, H, margin);

    // Nudge down/up on collisions
    let attempts = 0;
    while (placed.some((p) => overlaps(box, p, pad)) && attempts < 12) {
      box = clampBox({ ...box, y: box.y + (attempts % 2 === 0 ? 28 : -36) }, W, H, margin);
      attempts += 1;
    }
    placed.push(box);
  }

  if (input.loreSidebar?.title) {
    const bodyLines = wrapWords(input.loreSidebar.body || "", 34);
    const w = 460;
    const h = 56 + bodyLines.length * 22;
    placed.push({
      kind: "caption",
      x: W - margin - w,
      y: H - margin - h - 20,
      w,
      h,
      speaker: "LORE",
      lines: [input.loreSidebar.title, ...bodyLines],
    });
  }

  return placed;
}

/** SVG overlay using private/OS fonts — never served from /public. */
export function letteringToSvg(
  input: LetteringPageInput,
  fontFamily = "Georgia, 'Times New Roman', serif",
): string {
  const W = input.width;
  const H = input.height;
  const boxes = layoutLettering(input);
  const parts: string[] = [];

  for (const box of boxes) {
    if (box.kind === "sfx") {
      const fontSize = 40;
      const lineH = 46;
      box.lines.forEach((line, i) => {
        const tx = box.x + box.w / 2;
        const ty = box.y + 36 + i * lineH;
        parts.push(
          `<text x="${tx}" y="${ty}" text-anchor="middle" font-family="${fontFamily}" font-size="${fontSize}" font-weight="700" fill="#ffb84d" stroke="rgba(20,14,10,0.8)" stroke-width="3" paint-order="stroke" letter-spacing="0.1em">${escapeXml(line)}</text>`,
        );
      });
      continue;
    }

    const isBanner = box.kind === "narration" || (box.kind === "caption" && !box.speaker);
    const fill = isBanner
      ? "rgba(20,14,10,0.88)"
      : box.kind === "shout"
        ? "rgba(255,236,200,0.96)"
        : box.kind === "magic"
          ? "rgba(18,40,28,0.9)"
          : box.kind === "telepathy"
            ? "rgba(230,240,255,0.95)"
            : box.kind === "creature"
              ? "rgba(236,252,240,0.95)"
              : "rgba(255,252,245,0.96)";
    const stroke = "rgba(42,33,24,0.5)";
    const rx = box.kind === "thought" || box.kind === "telepathy" ? 26 : 16;
    const dash =
      box.kind === "thought" || box.kind === "telepathy"
        ? `stroke-dasharray="6 4"`
        : "";

    // Tail
    if (!isBanner && box.kind !== "caption" && box.kind !== "magic") {
      const cx = box.x + box.w / 2;
      const midY = box.y + box.h / 2;
      const tail = box.tail || "down";
      if (tail.startsWith("up")) {
        parts.push(
          `<polygon points="${cx - 14},${box.y + 2} ${cx + 14},${box.y + 2} ${cx},${box.y - 16}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`,
        );
      } else if (tail === "left") {
        parts.push(
          `<polygon points="${box.x + 2},${midY - 12} ${box.x + 2},${midY + 12} ${box.x - 16},${midY}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`,
        );
      } else if (tail === "right") {
        parts.push(
          `<polygon points="${box.x + box.w - 2},${midY - 12} ${box.x + box.w - 2},${midY + 12} ${box.x + box.w + 16},${midY}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`,
        );
      } else {
        parts.push(
          `<polygon points="${cx - 14},${box.y + box.h - 2} ${cx + 14},${box.y + box.h - 2} ${cx},${box.y + box.h + 16}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`,
        );
      }
    }

    parts.push(
      `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" ${dash}/>`,
    );

    let y = box.y + (isBanner ? 28 : 22);
    const textFill = isBanner || box.kind === "magic" ? "#f5ead2" : "#2a2118";
    if (box.speaker && box.speaker !== "LORE") {
      parts.push(
        `<text x="${box.x + 16}" y="${y}" font-family="${fontFamily}" font-size="13" fill="#8b5a3c" letter-spacing="0.12em">${escapeXml(box.speaker.toUpperCase())}</text>`,
      );
      y += 20;
    } else if (box.speaker === "LORE") {
      parts.push(
        `<text x="${box.x + 16}" y="${y}" font-family="${fontFamily}" font-size="12" fill="#ffb84d" letter-spacing="0.16em">LORE</text>`,
      );
      y += 22;
    }

    const fontSize = isBanner ? 22 : box.kind === "shout" ? 23 : 20;
    const lineH = fontSize + 8;
    box.lines.forEach((line, i) => {
      parts.push(
        `<text x="${box.x + 16}" y="${y + i * lineH}" font-family="${fontFamily}" font-size="${fontSize}" fill="${textFill}" font-style="${box.kind === "narration" || box.kind === "whisper" ? "italic" : "normal"}" font-weight="${box.kind === "shout" ? "700" : "400"}">${escapeXml(line)}</text>`,
      );
    });
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
${parts.join("\n")}
</svg>`;
}
