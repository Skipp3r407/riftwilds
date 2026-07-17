import type {
  MoodAxis,
  PersonalityFacet,
  RiftlingAiState,
  RiftlingMemory,
} from "@/game/riftling-ai/types";
import type { DayPhase, WeatherKey } from "@/game/living-world/clock";

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const FACETS: PersonalityFacet[] = [
  "loyalty",
  "curiosity",
  "bravery",
  "mischief",
  "empathy",
  "independence",
];

const PREF_POOL = [
  "warm nests",
  "tide pools",
  "ember glow",
  "quiet groves",
  "storm overlooks",
  "plaza music",
  "moonlight",
];

const FEAR_POOL = [
  "void haze",
  "loud forges",
  "deep water",
  "crowded markets",
  "sudden thunder",
  "loneliness",
];

export function createRiftlingAiState(input: {
  publicPetId: string;
  geneticsSeed: string;
  speciesSlug?: string;
}): RiftlingAiState {
  const h = hashStr(input.geneticsSeed);
  const personality = Object.fromEntries(
    FACETS.map((f, i) => {
      // Mix per-facet so values stay in 20–89 regardless of signed shift quirks.
      const mixed = hashStr(`${input.geneticsSeed}:${f}:${i}`);
      return [f, 20 + (mixed % 70)];
    }),
  ) as Record<PersonalityFacet, number>;

  const preferences = [
    PREF_POOL[h % PREF_POOL.length]!,
    PREF_POOL[((h >>> 4) % PREF_POOL.length)]!,
  ];
  const fears = [FEAR_POOL[((h >>> 8) % FEAR_POOL.length)]!];

  const moodRoll = (h >>> 0) % 7;
  const moods: MoodAxis[] = [
    "content",
    "playful",
    "curious",
    "anxious",
    "sleepy",
    "bold",
    "homesick",
  ];

  return {
    publicPetId: input.publicPetId,
    mood: moods[moodRoll]!,
    moodIntensity: 0.4 + (h % 50) / 100,
    personality,
    preferences,
    fears,
    memories: [
      {
        id: "m_hatch",
        kind: "care",
        label: "First warmth after hatching",
        salience: 0.9,
        occurredAt: new Date().toISOString(),
      },
    ],
    friendships: [],
    family: { parentIds: [], siblingIds: [], offspringIds: [] },
    learning: { trainedSkills: [], lessons: 0 },
  };
}

export function addMemory(
  state: RiftlingAiState,
  memory: Omit<RiftlingMemory, "id"> & { id?: string },
): RiftlingAiState {
  const next: RiftlingMemory = {
    id: memory.id ?? `m_${Date.now()}`,
    kind: memory.kind,
    label: memory.label,
    salience: memory.salience,
    occurredAt: memory.occurredAt,
    metadata: memory.metadata,
  };
  const memories = [next, ...state.memories].slice(0, 40);
  return { ...state, memories };
}

export function learnSkill(state: RiftlingAiState, skill: string): RiftlingAiState {
  if (state.learning.trainedSkills.includes(skill)) return state;
  return {
    ...state,
    learning: {
      trainedSkills: [...state.learning.trainedSkills, skill],
      lessons: state.learning.lessons + 1,
    },
  };
}

/** Idle environmental interaction — driven by day phase + weather + personality. */
export function resolveIdleEnvironmentInteraction(
  state: RiftlingAiState,
  env: { dayPhase: DayPhase; weather: WeatherKey; regionSlug: string },
): { action: string; moodShift?: MoodAxis; note: string } {
  const curiosity = state.personality.curiosity;
  const bravery = state.personality.bravery;

  const fearsVoid = state.fears.some((f) => f?.includes("void"));
  if ((env.weather.includes("void") || fearsVoid) && env.weather === "void_haze") {
    return {
      action: "hide_near_keeper",
      moodShift: "anxious",
      note: "Shrinks toward you until the haze thins.",
    };
  }

  if (env.dayPhase === "night" && curiosity > 50) {
    return {
      action: "watch_aurora",
      moodShift: "curious",
      note: "Sits facing the sky, collecting a soft discovery memory.",
    };
  }

  if (env.dayPhase === "dawn" && state.preferences.includes("warm nests")) {
    return {
      action: "stretch_in_sun",
      moodShift: "content",
      note: "Basks at the edge of camp.",
    };
  }

  if (env.weather === "ash_storm" && bravery < 40) {
    return {
      action: "seek_shelter",
      moodShift: "anxious",
      note: "Noses under a ledge until ash settles.",
    };
  }

  if (curiosity > 60) {
    return {
      action: "sniff_resource_node",
      moodShift: "playful",
      note: `Investigates a ${env.regionSlug} scent trail.`,
    };
  }

  return {
    action: "idle_companion",
    moodShift: "content",
    note: "Keeps pace beside you, humming softly.",
  };
}
