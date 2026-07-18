import { existsSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { COMIC_ISSUES, COVER, PAGE_ART, SPLASH, WALLPAPERS } from "@/content/comics";
import { resolveBubbleLayout } from "@/lib/comics/bubble-layout";

const publicRoot = join(process.cwd(), "public");

function existsPublic(src: string) {
  return existsSync(join(publicRoot, src.replace(/^\//, "")));
}

describe("Comic art library on disk", () => {
  it("ships every COVER / SPLASH / PAGE_ART / WALLPAPER file", () => {
    const paths = [
      ...Object.values(COVER),
      ...Object.values(SPLASH),
      ...Object.values(PAGE_ART),
      ...Object.values(WALLPAPERS),
    ];
    const missing = paths.filter((p) => !existsPublic(p));
    expect(missing, `Missing comic assets:\n${missing.join("\n")}`).toEqual([]);
  });

  it("gives every published page a real artSrc that exists", () => {
    const broken: string[] = [];
    for (const issue of COMIC_ISSUES) {
      for (const page of issue.pages) {
        const artSrc = page.artSrc ?? page.panels.find((p) => p.artSrc)?.artSrc;
        if (!artSrc) {
          broken.push(`${issue.slug} p${page.pageNumber}: no artSrc`);
          continue;
        }
        if (!existsPublic(artSrc)) {
          broken.push(`${issue.slug} p${page.pageNumber}: missing ${artSrc}`);
        }
      }
    }
    expect(broken, `Broken comic pages:\n${broken.join("\n")}`).toEqual([]);
  });
});

describe("Comic speech bubble layout", () => {
  it("places speech with tails and keeps narration in the caption band", () => {
    const laid = resolveBubbleLayout([
      { kind: "narration", text: "Night fell over the Commons." },
      {
        kind: "speech",
        speaker: "Elara Venn",
        text: "The egg is warm.",
        x: 28,
        y: 34,
        tail: "down",
      },
      { kind: "speech", speaker: "Stranger", text: "Take the crown road." },
      { kind: "sfx", text: "rift-crack…" },
    ]);

    expect(laid).toHaveLength(4);
    expect(laid[0]!.y).toBeLessThan(30);
    expect(laid[1]!.x).toBe(28);
    expect(laid[1]!.tail).toBe("down");
    expect(laid[2]!.x).toBeGreaterThan(50); // stranger lane
    expect(laid[3]!.kind).toBe("sfx");
  });
});
