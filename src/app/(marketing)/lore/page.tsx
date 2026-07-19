import { redirect } from "next/navigation";

/** Lore Library alias — canonical reader lives at /comics. */
export default function LoreLibraryAliasPage() {
  redirect("/comics");
}
