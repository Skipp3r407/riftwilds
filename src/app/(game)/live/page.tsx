import { redirect } from "next/navigation";

/** Legacy `/live` → playable `/live-world`. */
export default function LiveRedirectPage() {
  redirect("/live-world");
}
