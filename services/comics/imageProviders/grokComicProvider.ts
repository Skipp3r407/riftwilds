/**
 * Grok (xAI) image provider for Riftwilds comic page art.
 * Stage 1 only — text-free plates. Lettering is applied separately.
 *
 * Env:
 *   XAI_API_KEY          required for live generation
 *   XAI_IMAGE_MODEL      default grok-imagine-image
 *   COMIC_GROK_DELAY_MS  pause between calls (default 1200)
 */

export type GrokComicGenerateInput = {
  prompt: string;
  negativePrompt?: string;
  /** Portrait comic page */
  aspectRatio?: "3:4" | "2:3" | "1:1" | "16:9";
  /** Optional reference image URLs or local paths (documented; API support varies) */
  referenceImages?: string[];
  seed?: number;
  pageId?: string;
  promptVersion?: string;
};

export type GrokComicGenerateResult = {
  ok: boolean;
  engine: "grok" | "none";
  model?: string;
  b64?: string;
  bytes?: Buffer;
  error?: string;
  costStubUsd?: number;
  latencyMs?: number;
  limitations?: string[];
};

export type GrokComicProviderOptions = {
  apiKey?: string;
  model?: string;
  delayMs?: number;
  fetchImpl?: typeof fetch;
  log?: (msg: string, meta?: Record<string, unknown>) => void;
};

const DEFAULT_MODEL = "grok-imagine-image";
const ENDPOINT = "https://api.x.ai/v1/images/generations";

/** Capabilities honestly documented — do not fake unsupported features. */
export const GROK_COMIC_CAPABILITIES = {
  singlePage: true,
  panelByPanel: true, // via repeated single-image calls
  referenceImageInputs: false, // not reliably available on current Images API — prompt-only consistency
  seed: false,
  negativePromptNative: false, // folded into prompt text
  retry: true,
  costTracking: true, // stub estimate only
} as const;

export function buildComicArtPrompt(input: GrokComicGenerateInput): string {
  const neg = input.negativePrompt
    ? ` Avoid: ${input.negativePrompt}`
    : " Avoid: readable text, logos, watermarks, Marvel, DC, Pokémon.";
  return `${input.prompt}${neg}`;
}

export class GrokComicProvider {
  private apiKey: string | undefined;
  private model: string;
  private delayMs: number;
  private fetchImpl: typeof fetch;
  private log: (msg: string, meta?: Record<string, unknown>) => void;
  private lastCallAt = 0;
  totalCalls = 0;
  totalFailures = 0;
  estimatedCostUsd = 0;

  constructor(opts: GrokComicProviderOptions = {}) {
    this.apiKey = opts.apiKey ?? process.env.XAI_API_KEY;
    this.model = opts.model ?? process.env.XAI_IMAGE_MODEL ?? DEFAULT_MODEL;
    this.delayMs = opts.delayMs ?? Number(process.env.COMIC_GROK_DELAY_MS || 1200);
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.log = opts.log ?? ((msg, meta) => console.log(`[grokComic] ${msg}`, meta ?? ""));
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  limitations(): string[] {
    const out: string[] = [];
    if (!GROK_COMIC_CAPABILITIES.referenceImageInputs) {
      out.push("Reference-image inputs are not wired; use detailed continuity prompts + local ref sheets.");
    }
    if (!GROK_COMIC_CAPABILITIES.seed) {
      out.push("Seed/consistency tokens are not exposed by the current Images API wrapper.");
    }
    if (!GROK_COMIC_CAPABILITIES.negativePromptNative) {
      out.push("Negative prompts are appended to the positive prompt text.");
    }
    if (!this.apiKey) out.push("XAI_API_KEY missing — provider will not call the network.");
    return out;
  }

  private async throttle(): Promise<void> {
    const wait = this.delayMs - (Date.now() - this.lastCallAt);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  }

  async generatePage(input: GrokComicGenerateInput, retries = 2): Promise<GrokComicGenerateResult> {
    if (!this.apiKey) {
      return {
        ok: false,
        engine: "none",
        error: "XAI_API_KEY missing",
        limitations: this.limitations(),
      };
    }

    const prompt = buildComicArtPrompt(input);
    const aspect = input.aspectRatio ?? "3:4";
    let lastError = "";

    for (let attempt = 0; attempt <= retries; attempt++) {
      await this.throttle();
      const started = Date.now();
      this.lastCallAt = started;
      this.totalCalls += 1;
      try {
        const res = await this.fetchImpl(ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            prompt,
            n: 1,
            aspect_ratio: aspect,
            response_format: "b64_json",
          }),
        });
        if (!res.ok) {
          lastError = `Grok ${res.status}: ${(await res.text()).slice(0, 280)}`;
          this.totalFailures += 1;
          this.log("generate failed", { attempt, error: lastError, pageId: input.pageId });
          if (res.status === 429 || res.status >= 500) continue;
          break;
        }
        const json = (await res.json()) as { data?: { b64_json?: string }[] };
        const b64 = json?.data?.[0]?.b64_json;
        if (!b64) {
          lastError = "No b64_json in Grok response";
          this.totalFailures += 1;
          continue;
        }
        // Stub cost — update when xAI publishes comic-page pricing
        const costStubUsd = 0.06;
        this.estimatedCostUsd += costStubUsd;
        return {
          ok: true,
          engine: "grok",
          model: this.model,
          b64,
          bytes: Buffer.from(b64, "base64"),
          costStubUsd,
          latencyMs: Date.now() - started,
          limitations: this.limitations(),
        };
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        this.totalFailures += 1;
        this.log("generate exception", { attempt, error: lastError, pageId: input.pageId });
      }
    }

    return {
      ok: false,
      engine: "grok",
      model: this.model,
      error: lastError || "Unknown Grok failure",
      limitations: this.limitations(),
    };
  }

  /** Panel-first fallback: generate each panel prompt independently. */
  async generatePanels(
    panels: GrokComicGenerateInput[],
  ): Promise<GrokComicGenerateResult[]> {
    const results: GrokComicGenerateResult[] = [];
    for (const panel of panels) {
      results.push(await this.generatePage(panel));
    }
    return results;
  }
}

export function createGrokComicProvider(opts?: GrokComicProviderOptions): GrokComicProvider {
  return new GrokComicProvider(opts);
}
