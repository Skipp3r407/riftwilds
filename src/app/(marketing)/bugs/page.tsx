import { permanentRedirect } from "next/navigation";

/** Alias of /feedback */
export default function BugsAliasPage() {
  permanentRedirect("/feedback");
}
