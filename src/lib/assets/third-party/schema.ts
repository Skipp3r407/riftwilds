/**
 * Third-party asset registry schema for Riftwilds.
 * Discovery → license review → approval gate before any runtime import.
 */

export const ASSET_PIPELINE_STATUSES = [
  "DISCOVERED",
  "LICENSE_REVIEW",
  "APPROVED",
  "REJECTED",
  "NEEDS_ATTRIBUTION",
  "RESTRICTED",
  "IN_USE",
] as const;

export type AssetPipelineStatus = (typeof ASSET_PIPELINE_STATUSES)[number];

/** Statuses that must never be copied into public/ runtime paths. */
export const NON_RUNTIME_STATUSES: readonly AssetPipelineStatus[] = [
  "DISCOVERED",
  "LICENSE_REVIEW",
  "REJECTED",
  "RESTRICTED",
] as const;

/** Statuses allowed to enter production runtime after human approval. */
export const RUNTIME_ELIGIBLE_STATUSES: readonly AssetPipelineStatus[] = [
  "APPROVED",
  "NEEDS_ATTRIBUTION",
  "IN_USE",
] as const;

export const ALLOWED_LICENSE_CATEGORIES = [
  "CC0",
  "PUBLIC_DOMAIN",
  "EXPLICIT_FREE_COMMERCIAL",
  "MIT",
  "APACHE_2",
  "BSD",
  "CREATOR_COMMERCIAL_WITH_ATTRIBUTION",
] as const;

export type AllowedLicenseCategory = (typeof ALLOWED_LICENSE_CATEGORIES)[number];

export const REJECTED_LICENSE_REASONS = [
  "NO_LICENSE",
  "PERSONAL_ONLY",
  "NON_COMMERCIAL",
  "UNCLEAR_OWNERSHIP",
  "RIPPED_COMMERCIAL_GAME",
  "TRADEMARKED_CHARACTER",
  "AI_UNCLEAR_RIGHTS",
  "FAN_ART_CONFLICT",
  "FRANCHISE_LOOKALIKE",
  "TOS_PROHIBITS_USE",
  "OTHER",
] as const;

export type RejectedLicenseReason = (typeof REJECTED_LICENSE_REASONS)[number];

export const ASSET_KINDS = [
  "tileset",
  "sprite",
  "ui_icon",
  "texture",
  "hdri",
  "audio_sfx",
  "audio_music",
  "font",
  "3d_model",
  "vfx",
  "other",
] as const;

export type AssetKind = (typeof ASSET_KINDS)[number];

export type ThirdPartyAssetRecord = {
  id: string;
  title: string;
  kind: AssetKind;
  sourceUrl: string;
  previewUrl?: string;
  creator: string;
  licenseName: string;
  licenseUrl?: string;
  licenseCategory: AllowedLicenseCategory | "UNKNOWN" | "RESTRICTED";
  status: AssetPipelineStatus;
  styleScore: number;
  riskNotes: string[];
  attributionRequired: boolean;
  attributionText?: string;
  /** Content hash or source pack id for duplicate detection. */
  fingerprint?: string;
  sourcePackId?: string;
  rejectReason?: RejectedLicenseReason;
  discoveredAt: string;
  reviewedAt?: string;
  notes?: string;
  /** Never point at public/ for DISCOVERED/RESTRICTED packs. */
  privatePath?: string;
  runtimePath?: string;
};

export type ThirdPartyAssetRegistry = {
  version: string;
  updatedAt: string;
  policyDoc: string;
  records: ThirdPartyAssetRecord[];
};

export type ValidationIssue = {
  code: string;
  message: string;
  recordId?: string;
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};
