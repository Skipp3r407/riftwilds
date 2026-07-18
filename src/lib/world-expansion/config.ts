/** Capacity + expansion thresholds — tune without redeploying generation logic. */

export const GENERATOR_VERSION = "1.0.0";
export const TEMPLATE_CATALOG_VERSION = "1.0.0";
export const SEED_SCHEME_VERSION = "1.0.0";

/** Soft load ratio (players / soft limit) that starts planning. */
export const SOFT_CAPACITY_RATIO = 0.72;
/** Hard load ratio that forces overflow / urgent expansion. */
export const HARD_CAPACITY_RATIO = 0.92;
/** Plot occupancy ratio that triggers housing expansion. */
export const PLOT_SOFT_RATIO = 0.75;
export const PLOT_HARD_RATIO = 0.9;

/** Rolling windows (ms) for forecasting — ignore single festival spikes for permanent cities. */
export const ROLLING_WINDOW_MS = 30 * 60 * 1000;
export const ROLLING_SAMPLE_MAX = 24;
/** Spike if latest > rolling avg * this factor. */
export const SPIKE_FACTOR = 1.85;
/** Need sustained rolling avg above this to plan a permanent city. */
export const PERMANENT_FORECAST_THRESHOLD = 0.68;
/** Festival / boss overflow when absolute load is high even if spike. */
export const OVERFLOW_ABSOLUTE_RATIO = 0.88;

export const GENERATION_MAX_ATTEMPTS = 3;
export const RELOCATION_SNAPSHOT_TTL_MS = 15 * 60 * 1000;

export const FOUNDER_TITLE_PREFIX = "title_founder_";
export const FOUNDER_COSMETIC_KEYS = [
  "cosmetic_founder_lantern",
  "cosmetic_founder_banner_trim",
] as const;
export const FOUNDER_FURNITURE_KEYS = [
  "furn_founder_hearth_plaque",
  "furn_founder_welcome_mat",
] as const;
