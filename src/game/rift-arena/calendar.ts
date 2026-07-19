/** Event calendar stubs for hub UI — entertainment schedules only. */

export type ArenaCalendarEvent = {
  id: string;
  title: string;
  when: string;
  kind: "FREE_NIGHT" | "RANKED_RESET" | "TOURNAMENT" | "COMMUNITY";
  href: string;
  stakeRequired: false;
};

export function listArenaCalendar(): ArenaCalendarEvent[] {
  return [
    {
      id: "cal-free-friday",
      title: "Free Play Friday",
      when: "Fridays · all day",
      kind: "FREE_NIGHT",
      href: "/tcg/battle",
      stakeRequired: false,
    },
    {
      id: "cal-ranked-reset",
      title: "Ranked soft reset (scaffold)",
      when: "Season end · Sep 30",
      kind: "RANKED_RESET",
      href: "/arena/ranked",
      stakeRequired: false,
    },
    {
      id: "cal-commons-cup",
      title: "Commons Cup — free bracket",
      when: "Coming soon",
      kind: "TOURNAMENT",
      href: "/arena/tournaments",
      stakeRequired: false,
    },
    {
      id: "cal-watch-party",
      title: "Spectator watch stubs",
      when: "Live when spectate flag on",
      kind: "COMMUNITY",
      href: "/arena/spectate",
      stakeRequired: false,
    },
  ];
}
