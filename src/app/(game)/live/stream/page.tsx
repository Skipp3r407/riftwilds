import { redirect } from "next/navigation";

/** Legacy stream view → optional spectator (disabled by default). */
export default function LiveStreamRedirectPage() {
  redirect("/live-world/spectate");
}
