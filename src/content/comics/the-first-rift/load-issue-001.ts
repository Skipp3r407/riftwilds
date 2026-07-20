/**
 * Server/helper re-exports for Issue #001.
 * Runtime catalog uses `issue-001.generated.ts` (no fs in client bundles).
 */
export {
  ISSUE_001_COMIC,
  ISSUE_001_TRANSCRIPTS,
  getIssue001Transcript,
} from "@/content/comics/the-first-rift/issue-001.generated";

export function issue001Available(): boolean {
  return true;
}
