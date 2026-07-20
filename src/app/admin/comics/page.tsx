import { ComicStudio } from "@/components/comics/comic-studio";
import { COMIC_ISSUES } from "@/content/comics";

export const metadata = { title: "Admin · Comic Studio" };

export default function AdminComicsPage() {
  return <ComicStudio issues={COMIC_ISSUES} />;
}
