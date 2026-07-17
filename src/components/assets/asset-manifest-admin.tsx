"use client";

import { useMemo, useState } from "react";
import type { AssetFileStatus, AssetManifestDocument } from "@/lib/assets/asset-manifest";

const STATUS_FILTERS: Array<AssetFileStatus | "all"> = [
  "all",
  "pending",
  "generated",
  "failed",
  "legacy",
  "planned",
];

export function AssetManifestAdmin({ manifest }: { manifest: AssetManifestDocument }) {
  const [status, setStatus] = useState<AssetFileStatus | "all">("pending");
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState("");

  const categories = useMemo(() => {
    const set = new Set(manifest.assets.map((a) => a.category));
    return ["all", ...Array.from(set).sort()];
  }, [manifest.assets]);

  const rows = useMemo(() => {
    return manifest.assets
      .filter((a) => (status === "all" ? true : a.status === status))
      .filter((a) => (category === "all" ? true : a.category === category))
      .filter((a) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          a.id.toLowerCase().includes(s) ||
          a.label.toLowerCase().includes(s) ||
          a.publicPath.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
  }, [manifest.assets, status, category, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            className={status === s ? "btn-primary px-3 py-2 text-sm" : "btn-secondary px-3 py-2 text-sm"}
            onClick={() => setStatus(s)}
          >
            {s}
            {s !== "all" ? ` (${manifest.byStatus[s] ?? 0})` : ""}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="min-w-[220px] flex-1 rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          placeholder="Search id, label, path…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="self-center text-sm text-[var(--text-muted)]">{rows.length} shown</span>
      </div>

      <div className="panel overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">P</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="px-4 py-3 font-medium">Path</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 200).map((a) => (
              <tr key={a.id} className="border-b border-white/5">
                <td className="px-4 py-2 capitalize text-white">{a.status}</td>
                <td className="px-4 py-2 text-[var(--text-muted)]">{a.priority}</td>
                <td className="px-4 py-2 text-[var(--cyan)]">{a.category}</td>
                <td className="px-4 py-2 text-white">{a.label}</td>
                <td className="px-4 py-2 font-mono text-xs text-[var(--text-muted)]">{a.publicPath}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 200 ? (
          <p className="px-4 py-3 text-xs text-[var(--text-muted)]">
            Showing first 200 of {rows.length}. Narrow filters to browse more.
          </p>
        ) : null}
      </div>
    </div>
  );
}
