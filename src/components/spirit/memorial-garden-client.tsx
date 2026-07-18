"use client";

import { useCallback, useEffect, useState } from "react";

type Memorial = {
  id: string;
  name: string;
  speciesName: string;
  level: number;
  bond: number;
  cause: string;
  lostAt: string;
  messages: { fromKey: string; text: string; at: string }[];
};

type Garden = {
  unlocked: boolean;
  flowers: number;
  candles: number;
  lanterns: number;
  statues: string[];
};

export function MemorialGardenClient() {
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [garden, setGarden] = useState<Garden | null>(null);
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/memorials");
    if (!res.ok) return;
    const json = await res.json();
    setMemorials(json.memorials ?? []);
    setGarden(json.garden ?? null);
    if (!selected && json.memorials?.[0]) setSelected(json.memorials[0].id);
  }, [selected]);

  useEffect(() => {
    void load();
  }, [load]);

  const tribute = async () => {
    if (!selected || !text.trim()) return;
    const res = await fetch("/api/memorials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memorialId: selected, text, decorate: "flowers" }),
    });
    const json = await res.json();
    setNote(res.ok ? "Tribute left." : json.error ?? "Failed");
    setText("");
    await load();
  };

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Memorials
        </h2>
        {memorials.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No Hardcore memorials yet. Normal play recovers Downed Riftlings instead of losing them.
          </p>
        ) : (
          <ul className="space-y-2">
            {memorials.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelected(m.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    selected === m.id
                      ? "border-[var(--cyan)] bg-[var(--cyan)]/10"
                      : "border-[var(--line)]"
                  }`}
                >
                  <span className="text-[var(--ink)]">{m.name}</span>
                  <span className="block text-xs text-[var(--muted)]">
                    {m.speciesName} · Lv {m.level} · Bond {m.bond}
                  </span>
                  <span className="block text-xs text-[var(--muted)]">{m.cause}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Garden
        </h2>
        {garden && (
          <p className="text-sm text-[var(--muted)]">
            {garden.unlocked ? "Unlocked" : "Visit a memorial to unlock"} · Flowers {garden.flowers} ·
            Candles {garden.candles} · Lanterns {garden.lanterns} · Statues {garden.statues.length}
          </p>
        )}
        <label className="block text-xs text-[var(--muted)]">
          Leave a message
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-[var(--line)] bg-transparent px-2 py-1 text-sm text-[var(--ink)]"
            maxLength={280}
          />
        </label>
        <button
          type="button"
          onClick={() => void tribute()}
          disabled={!selected}
          className="rounded bg-[var(--cyan)]/20 px-3 py-1.5 text-sm text-[var(--ink)] hover:bg-[var(--cyan)]/30 disabled:opacity-40"
        >
          Leave flowers & message
        </button>
        {note && (
          <p className="text-sm" role="status">
            {note}
          </p>
        )}
        {selected &&
          memorials
            .find((m) => m.id === selected)
            ?.messages.slice(-5)
            .map((msg, i) => (
              <p key={`${msg.at}-${i}`} className="text-xs text-[var(--muted)]">
                {msg.text}
              </p>
            ))}
      </div>
    </section>
  );
}
