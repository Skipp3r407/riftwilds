/** Portal definitions — Commons hub + return portals. */

export type PortalDef = {
  id: string;
  fromRegionId: string;
  toRegionId: string;
  label: string;
  /** Locked until unlock gate passes — never paid. */
  lockedByDefault: boolean;
  unlockFlag?: string;
};

export const PORTAL_DEFS: PortalDef[] = [
  // Commons → hubs (open)
  {
    id: "commons-to-ember",
    fromRegionId: "riftwild-commons",
    toRegionId: "ember-crater",
    label: "Ember Crater",
    lockedByDefault: false,
  },
  {
    id: "commons-to-coast",
    fromRegionId: "riftwild-commons",
    toRegionId: "moonwater-coast",
    label: "Moonwater Coast",
    lockedByDefault: false,
  },
  {
    id: "commons-to-elderwood",
    fromRegionId: "riftwild-commons",
    toRegionId: "elderwood-forest",
    label: "Elderwood Forest",
    lockedByDefault: false,
  },
  // Commons → locked progression
  {
    id: "commons-to-stormspire",
    fromRegionId: "riftwild-commons",
    toRegionId: "stormspire-peaks",
    label: "Stormspire Peaks",
    lockedByDefault: true,
    unlockFlag: "unlock-stormspire",
  },
  {
    id: "commons-to-stoneheart",
    fromRegionId: "riftwild-commons",
    toRegionId: "stoneheart-canyon",
    label: "Stoneheart Canyon",
    lockedByDefault: true,
    unlockFlag: "unlock-stoneheart",
  },
  {
    id: "commons-to-frostveil",
    fromRegionId: "riftwild-commons",
    toRegionId: "frostveil-basin",
    label: "Frostveil Basin",
    lockedByDefault: true,
    unlockFlag: "unlock-frostveil",
  },
  {
    id: "commons-to-radiant",
    fromRegionId: "riftwild-commons",
    toRegionId: "radiant-citadel",
    label: "Radiant Citadel",
    lockedByDefault: true,
    unlockFlag: "unlock-radiant",
  },
  {
    id: "commons-to-void",
    fromRegionId: "riftwild-commons",
    toRegionId: "void-hollow",
    label: "Void Hollow",
    lockedByDefault: true,
    unlockFlag: "unlock-void",
  },
  {
    id: "commons-to-alloy",
    fromRegionId: "riftwild-commons",
    toRegionId: "alloy-ruins",
    label: "Alloy Ruins",
    lockedByDefault: true,
    unlockFlag: "unlock-alloy",
  },
  {
    id: "commons-to-spirit",
    fromRegionId: "riftwild-commons",
    toRegionId: "spirit-marsh",
    label: "Spirit Marsh",
    lockedByDefault: true,
    unlockFlag: "unlock-spirit",
  },
  {
    id: "commons-to-celestial",
    fromRegionId: "riftwild-commons",
    toRegionId: "celestial-rift",
    label: "Celestial Rift",
    lockedByDefault: true,
    unlockFlag: "unlock-celestial",
  },
  // Return portals
  {
    id: "ember-to-commons",
    fromRegionId: "ember-crater",
    toRegionId: "riftwild-commons",
    label: "Riftwild Commons",
    lockedByDefault: false,
  },
  {
    id: "coast-to-commons",
    fromRegionId: "moonwater-coast",
    toRegionId: "riftwild-commons",
    label: "Riftwild Commons",
    lockedByDefault: false,
  },
  {
    id: "elderwood-to-commons",
    fromRegionId: "elderwood-forest",
    toRegionId: "riftwild-commons",
    label: "Riftwild Commons",
    lockedByDefault: false,
  },
];

export const PORTALS_FROM_REGION = (regionId: string) =>
  PORTAL_DEFS.filter((p) => p.fromRegionId === regionId);
