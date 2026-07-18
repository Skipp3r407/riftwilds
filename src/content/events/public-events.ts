/**
 * Public events — capped Credit rewards + paired sinks.
 */

export type PublicEventDef = {
  id: string;
  regionId: string;
  name: string;
  description: string;
  creditReward: number;
  dailyCapPerUser: number;
  pairedSink: string;
  scheduleHint: string;
  activeStub: boolean;
};

export const PUBLIC_EVENTS: PublicEventDef[] = [
  {
    id: "event-commons-spar",
    regionId: "riftwild-commons",
    name: "Training Yard Spar",
    description: "Friendly spars in the Commons yard. Repair sinks absorb rewards.",
    creditReward: 35,
    dailyCapPerUser: 70,
    pairedSink: "REPAIR",
    scheduleHint: "Evenings (world clock)",
    activeStub: true,
  },
  {
    id: "event-commons-market-day",
    regionId: "riftwild-commons",
    name: "Plaza Market Day",
    description: "Browse stalls; listing and shop fees leave circulation.",
    creditReward: 25,
    dailyCapPerUser: 50,
    pairedSink: "MARKETPLACE_FEE",
    scheduleHint: "Weekend window stub",
    activeStub: true,
  },
  {
    id: "event-frost-aurora",
    regionId: "frostveil-basin",
    name: "Aurora Watch",
    description: "Survey the aurora — travel fees apply to reach the basin.",
    creditReward: 50,
    dailyCapPerUser: 100,
    pairedSink: "TRAVEL_FEE",
    scheduleHint: "Seasonal stub",
    activeStub: true,
  },
  {
    id: "event-celestial-starfall",
    regionId: "celestial-rift",
    name: "Starfall Convergence",
    description: "Endgame public event with repair sinks after combat.",
    creditReward: 80,
    dailyCapPerUser: 160,
    pairedSink: "REPAIR",
    scheduleHint: "Endgame calendar stub",
    activeStub: true,
  },
  {
    id: "event-ember-public",
    regionId: "ember-crater",
    name: "Ashfall Vigil",
    description: "Hold the ash rim during a heat shimmer.",
    creditReward: 45,
    dailyCapPerUser: 90,
    pairedSink: "RESTORATION_DONATION",
    scheduleHint: "Weekly stub",
    activeStub: true,
  },
  {
    id: "event-moon-tidefair",
    regionId: "moonwater-coast",
    name: "Tidefair Gathering",
    description: "Coast keepers trade brine goods — shop fees leave circulation.",
    creditReward: 40,
    dailyCapPerUser: 80,
    pairedSink: "NPC_SHOP_BUY",
    scheduleHint: "Weekend stub",
    activeStub: true,
  },
  {
    id: "event-elder-chorus",
    regionId: "elderwood-forest",
    name: "Grove Chorus",
    description: "Join the evening grove chorus — travel and care sinks apply.",
    creditReward: 40,
    dailyCapPerUser: 80,
    pairedSink: "TRAVEL_FEE",
    scheduleHint: "Evenings stub",
    activeStub: true,
  },
  {
    id: "event-storm-tempest",
    regionId: "stormspire-peaks",
    name: "Tempest Watch",
    description: "Hold the wind beacons through a sparks-rain cycle.",
    creditReward: 55,
    dailyCapPerUser: 110,
    pairedSink: "REPAIR",
    scheduleHint: "Storm season stub",
    activeStub: true,
  },
  {
    id: "event-stone-quarry",
    regionId: "stoneheart-canyon",
    name: "Quarry Bell Day",
    description: "Haulers race fossil ledgers — listing fees leave circulation.",
    creditReward: 45,
    dailyCapPerUser: 90,
    pairedSink: "MARKETPLACE_FEE",
    scheduleHint: "Weekly stub",
    activeStub: true,
  },
  {
    id: "event-radiant-solstice",
    regionId: "radiant-citadel",
    name: "Solstice Procession",
    description: "Temple light walk — apothecary sinks absorb rewards.",
    creditReward: 60,
    dailyCapPerUser: 120,
    pairedSink: "NPC_SHOP_BUY",
    scheduleHint: "Seasonal stub",
    activeStub: true,
  },
  {
    id: "event-void-eclipse",
    regionId: "void-hollow",
    name: "Null Eclipse",
    description: "Seal patrols during a void distortion spike.",
    creditReward: 70,
    dailyCapPerUser: 140,
    pairedSink: "RESTORATION_DONATION",
    scheduleHint: "Late-game calendar stub",
    activeStub: true,
  },
  {
    id: "event-alloy-sparkfall",
    regionId: "alloy-ruins",
    name: "Sparkfall Salvage",
    description: "Salvage run when conduits surge — craft fees apply.",
    creditReward: 55,
    dailyCapPerUser: 110,
    pairedSink: "CRAFT_FEE",
    scheduleHint: "Weekly stub",
    activeStub: true,
  },
  {
    id: "event-spirit-vigil",
    regionId: "spirit-marsh",
    name: "Lantern Vigil",
    description: "Keep memory lanterns lit through the thickest mist.",
    creditReward: 50,
    dailyCapPerUser: 100,
    pairedSink: "NPC_SHOP_BUY",
    scheduleHint: "Evenings stub",
    activeStub: true,
  },
];

export function eventsForRegion(regionId: string): PublicEventDef[] {
  return PUBLIC_EVENTS.filter((e) => e.regionId === regionId);
}
