import type { StoryArcDef } from "@/game/story/types";

/** Sample branching personal + world-linked arc for the story engine. */
export const FIRST_RIFT_LIGHT_ARC: StoryArcDef = {
  key: "first_rift_light",
  name: "First Rift Light",
  synopsis:
    "A keeper notices an unstable aurora over the Commons — personal choice shapes early reputation with wardens and wildfolk.",
  scope: "personal",
  regionKey: "riftwild-commons",
  startNodeId: "plaza_glimpse",
  featureFlag: "STORY_ENGINE_ENABLED",
  imageSrc: "/assets/story/first-rift-light.png",
  nodes: [
    {
      id: "plaza_glimpse",
      title: "Aurora over the plaza",
      body: "Violet threads stitch the dusk sky. Your Riftling tugs toward the light — or toward the warden post.",
      speaker: "Narrator",
      choices: [
        {
          id: "follow_pet",
          label: "Follow your Riftling into the glow",
          nextNodeId: "wild_edge",
          reputationDelta: { wildfolk: 2 },
          flagsSet: ["chose_curiosity"],
        },
        {
          id: "report_warden",
          label: "Report the surge to Warden Thol",
          nextNodeId: "warden_brief",
          reputationDelta: { wardens: 2 },
          flagsSet: ["chose_duty"],
        },
      ],
    },
    {
      id: "wild_edge",
      title: "Edge of the Commons",
      body: "Fireflies reverse their paths. A scrap of Celestora lore hums in the grass — the Archivist will want this.",
      speaker: "Your Riftling",
      choices: [
        {
          id: "collect_scrap",
          label: "Collect the lore scrap",
          nextNodeId: "archivist_handin",
          reputationDelta: { archivist: 1, wildfolk: 1 },
          unlockAchievementKey: "story_first_choice",
        },
        {
          id: "leave_it",
          label: "Leave the scrap for the wild",
          nextNodeId: null,
          reputationDelta: { wildfolk: 3 },
          flagsSet: ["left_scrap"],
        },
      ],
    },
    {
      id: "warden_brief",
      title: "Night briefing",
      body: "Thol marks the surge on a chalk map. 'Keepers who watch the sky keep the Commons standing.'",
      speaker: "Warden Thol",
      choices: [
        {
          id: "volunteer_patrol",
          label: "Volunteer for dusk patrol",
          nextNodeId: null,
          reputationDelta: { wardens: 3 },
          unlockQuestKey: "daily_commons_patrol",
          unlockAchievementKey: "story_first_choice",
        },
        {
          id: "ask_mira",
          label: "Ask Keeper Mira what eggs sense",
          nextNodeId: "mira_advice",
          reputationDelta: { hatchery: 1, wardens: 1 },
        },
      ],
    },
    {
      id: "mira_advice",
      title: "Hatchery hush",
      body: "Mira cups a warm egg. 'They dream of weather before we feel it. Care well — the world listens.'",
      speaker: "Keeper Mira",
      choices: [
        {
          id: "promise_care",
          label: "Promise careful tending",
          nextNodeId: null,
          reputationDelta: { hatchery: 2 },
          unlockAchievementKey: "story_first_choice",
        },
      ],
    },
    {
      id: "archivist_handin",
      title: "Echo catalogs the scrap",
      body: "The Archivist's lantern brightens. 'Another thread in the living timeline. Civilization remembers keepers like you.'",
      speaker: "Archivist Echo",
      choices: [
        {
          id: "done",
          label: "Thank Echo and return",
          nextNodeId: null,
          reputationDelta: { archivist: 2 },
          flagsSet: ["archivist_trust_1"],
        },
      ],
    },
  ],
};

export const SEASONAL_BLOOM_ARC: StoryArcDef = {
  key: "bloomtide_gathering",
  name: "Bloomtide Gathering",
  synopsis: "Seasonal community story — keepers restore a grove shrine together.",
  scope: "seasonal",
  seasonKey: "bloom",
  regionKey: "elderwood-forest",
  startNodeId: "shrine_cracked",
  featureFlag: "STORY_ENGINE_ENABLED",
  imageSrc: "/assets/story/bloomtide-gathering.png",
  nodes: [
    {
      id: "shrine_cracked",
      title: "Cracked grove shrine",
      body: "Elder Sylla invites keepers to mend the Bloomtide shrine before frost returns.",
      speaker: "Grove Elder Sylla",
      choices: [
        {
          id: "donate_herbs",
          label: "Offer grove herbs",
          nextNodeId: "shrine_mended",
          reputationDelta: { grove: 2, community: 1 },
        },
        {
          id: "rally_guild",
          label: "Rally your guild (stub)",
          nextNodeId: "shrine_mended",
          reputationDelta: { community: 3, guild: 1 },
          flagsSet: ["guild_rally_attempt"],
        },
      ],
    },
    {
      id: "shrine_mended",
      title: "Shrine lights",
      body: "Moss knits over the stone. Civilization restoration ticks forward — a permanent world scar of hope.",
      speaker: "Narrator",
      choices: [
        {
          id: "finish",
          label: "Witness the bloom",
          nextNodeId: null,
          unlockAchievementKey: "seasonal_bloom_witness",
        },
      ],
    },
  ],
};

export const SAMPLE_STORY_ARCS: StoryArcDef[] = [FIRST_RIFT_LIGHT_ARC, SEASONAL_BLOOM_ARC];
