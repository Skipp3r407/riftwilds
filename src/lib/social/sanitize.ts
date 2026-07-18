import { MAX_FRIEND_NOTE_LEN, MAX_MESSAGE_LEN } from "@/lib/social/rules";

const PROFANITY_STUB = /\b(badword|hateword)\b/gi;

export function sanitizeSocialText(raw: string, maxLen: number): string {
  let s = raw.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  s = s.slice(0, maxLen);
  s = s.replace(PROFANITY_STUB, "***");
  s = s.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<[^>]*>/g, "");
  return s.trim();
}

export function sanitizePmBody(raw: string): string {
  return sanitizeSocialText(raw, MAX_MESSAGE_LEN);
}

export function sanitizeFriendNote(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const s = sanitizeSocialText(raw, MAX_FRIEND_NOTE_LEN);
  return s.length ? s : null;
}
