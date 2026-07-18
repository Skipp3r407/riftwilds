import { permanentRedirect } from "next/navigation";

/** Alias of /patch-notes */
export default function UpdatesAliasPage() {
  permanentRedirect("/patch-notes");
}
