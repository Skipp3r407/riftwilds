"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import type { EquipmentPanelPayload } from "@/game/live-world/types";
import {
  EQUIPMENT_SLOT_KEYS,
  LOADOUT_PRESET_NAMES,
  type AppearanceSnapshot,
  type EquipmentSlotKey,
  type SlotLoadoutMap,
} from "@/lib/equipment/types";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";

type Props = { bridge: LiveWorldBridge };

type CompatibleRow = {
  itemId: string;
  name: string;
  slot: EquipmentSlotKey;
  rarity: string;
  iconPath: string;
  compatible: boolean;
  reason?: string;
};

type EquipmentApiState = {
  slots: SlotLoadoutMap;
  revision: number;
  ownedEquippable: CompatibleRow[];
  presets: Array<{ name: string; active: boolean; revision: number }>;
  appearance: AppearanceSnapshot | null;
};

const SLOT_LABELS: Record<EquipmentSlotKey, string> = {
  weapon: "Weapon",
  armor: "Armor",
  head: "Head",
  back: "Back",
  paw: "Paws",
  tail: "Tail",
  wing: "Wings",
  charm: "Charm",
  cosmetic: "Cosmetic",
};

export function LiveWorldEquipmentPanel({ bridge }: Props) {
  const [panel, setPanel] = useState<EquipmentPanelPayload | null>(null);
  const [state, setState] = useState<EquipmentApiState | null>(null);
  const [slotFilter, setSlotFilter] = useState<EquipmentSlotKey | "all">("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => bridge.equipmentPanel.subscribe(setPanel), [bridge]);

  const load = useCallback(async (publicPetId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/pets/${encodeURIComponent(publicPetId)}/equipment`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Failed to load equipment");
        return;
      }
      setState({
        slots: data.loadout.slots,
        revision: data.loadout.revision,
        ownedEquippable: data.ownedEquippable ?? [],
        presets: data.presets ?? [],
        appearance: data.appearance,
      });
      if (data.appearance) {
        bridge.setPetAppearance(data.appearance);
      }
    } catch {
      setError("Could not reach equipment service.");
    }
  }, [bridge]);

  useEffect(() => {
    if (panel?.open && panel.publicPetId) {
      void load(panel.publicPetId);
    }
  }, [panel?.open, panel?.publicPetId, load]);

  const filtered = useMemo(() => {
    if (!state) return [];
    return state.ownedEquippable.filter((row) => {
      if (slotFilter !== "all" && row.slot !== slotFilter) return false;
      if (query && !row.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [state, slotFilter, query]);

  async function equip(itemId: string) {
    if (!panel || panel.inspectOnly) return;
    setBusy(true);
    setStatus(null);
    setError(null);
    playSfx("pets.equip");
    try {
      const res = await fetch(
        `/api/pets/${encodeURIComponent(panel.publicPetId)}/equipment/equip`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "equip", itemId }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        playSfx("ui.error");
        setError(data.message ?? data.error ?? "Equip rejected");
        setBusy(false);
        return;
      }
      setState((prev) =>
        prev
          ? {
              ...prev,
              slots: data.loadout.slots,
              revision: data.revision,
              appearance: data.appearance,
            }
          : prev,
      );
      bridge.setPetAppearance(data.appearance);
      setStatus(data.message ?? "Equipped");
      playSfx("pets.equip");
      void load(panel.publicPetId);
    } catch {
      setError("Equip request failed.");
    }
    setBusy(false);
  }

  async function unequip(slot: EquipmentSlotKey) {
    if (!panel || panel.inspectOnly) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/pets/${encodeURIComponent(panel.publicPetId)}/equipment/equip`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "unequip", slot }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Unequip rejected");
        setBusy(false);
        return;
      }
      bridge.setPetAppearance(data.appearance);
      setStatus(data.message ?? "Unequipped");
      void load(panel.publicPetId);
    } catch {
      setError("Unequip request failed.");
    }
    setBusy(false);
  }

  async function activatePreset(presetName: string) {
    if (!panel || panel.inspectOnly) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/pets/${encodeURIComponent(panel.publicPetId)}/equipment`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "activate_preset", presetName }),
        },
      );
      const data = await res.json();
      if (res.ok && data.appearance) {
        bridge.setPetAppearance(data.appearance);
        setStatus(`Preset: ${presetName}`);
        void load(panel.publicPetId);
      }
    } catch {
      setError("Preset switch failed.");
    }
    setBusy(false);
  }

  if (!panel?.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="equipment-panel-title"
      onClick={() => {
        bridge.closeEquipmentPanel();
        playSfx("ui.modal_close");
      }}
    >
      <div
        className="panel max-h-[92vh] w-full max-w-3xl overflow-hidden shadow-[0_0_40px_rgba(61,231,255,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--stroke)] px-4 py-3">
          <div>
            <p className="page-kicker">Riftling equipment</p>
            <h2 id="equipment-panel-title" className="font-display text-xl text-white">
              {panel.petLabel}
            </h2>
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              Owned gear only · revision {state?.revision ?? "—"} · cosmetics free of SOL gates
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary focus-ring text-xs"
            onClick={() => {
              bridge.closeEquipmentPanel();
              playSfx("ui.modal_close");
            }}
          >
            Close
          </button>
        </div>

        <div className="grid max-h-[calc(92vh-4.5rem)] gap-0 overflow-y-auto lg:grid-cols-[220px_1fr]">
          <div className="border-b border-[var(--stroke)] p-4 lg:border-b-0 lg:border-r">
            <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(61,231,255,0.14),transparent_65%)]" />
              <Image
                src="/assets/placeholders/creature-cindercub-battle.svg"
                alt=""
                width={140}
                height={140}
                unoptimized
              />
              {state?.appearance?.layers.map((layer) => (
                <Image
                  key={layer.itemId}
                  src={layer.iconPath}
                  alt=""
                  width={36}
                  height={36}
                  className="absolute"
                  style={{
                    bottom:
                      layer.attachment.includes("paw") || layer.attachment.includes("tail")
                        ? 18
                        : layer.attachment === "head" || layer.attachment === "horn"
                          ? 96
                          : 48,
                    right: layer.attachment.includes("Right")
                      ? 12
                      : layer.attachment.includes("Left") || layer.attachment.includes("tail")
                        ? undefined
                        : 28,
                    left:
                      layer.attachment.includes("Left") || layer.attachment.includes("tail")
                        ? 12
                        : undefined,
                  }}
                  unoptimized
                />
              ))}
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              {EQUIPMENT_SLOT_KEYS.map((slot) => {
                const id = state?.slots[slot];
                return (
                  <li
                    key={slot}
                    className="flex items-center justify-between gap-2 rounded-md bg-[var(--bg-elevated)] px-2 py-1.5"
                  >
                    <button
                      type="button"
                      className="text-left text-[var(--text-muted)] hover:text-white"
                      onClick={() => setSlotFilter(slot)}
                    >
                      {SLOT_LABELS[slot]}
                    </button>
                    <span className="truncate text-white">{id ?? "—"}</span>
                    {id && !panel.inspectOnly ? (
                      <button
                        type="button"
                        className="text-[10px] text-[var(--amber)]"
                        disabled={busy}
                        onClick={() => void unequip(slot)}
                      >
                        Off
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1">
              {LOADOUT_PRESET_NAMES.map((name) => {
                const active = state?.presets.find((p) => p.name === name)?.active;
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={busy || panel.inspectOnly}
                    className={cn(
                      "rounded px-2 py-1 text-[10px]",
                      active
                        ? "bg-[rgba(61,231,255,0.2)] text-[var(--cyan)]"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)]",
                    )}
                    onClick={() => void activatePreset(name)}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="focus-ring min-w-[140px] flex-1 rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-white"
                placeholder="Filter owned gear…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="focus-ring rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-2 py-2 text-sm text-white"
                value={slotFilter}
                onChange={(e) =>
                  setSlotFilter(e.target.value as EquipmentSlotKey | "all")
                }
              >
                <option value="all">All slots</option>
                {EQUIPMENT_SLOT_KEYS.map((s) => (
                  <option key={s} value={s}>
                    {SLOT_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {panel.inspectOnly ? (
              <p className="mt-3 text-xs text-[var(--amber)]">
                Inspect only — you cannot change another Keeper&apos;s loadout.
              </p>
            ) : null}

            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {filtered.map((row) => (
                <li
                  key={row.itemId}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2",
                    row.compatible
                      ? "border-[rgba(61,231,255,0.2)] bg-[var(--bg-elevated)]"
                      : "border-[rgba(255,180,80,0.2)] bg-[rgba(255,180,80,0.06)] opacity-80",
                  )}
                >
                  <Image src={row.iconPath} alt="" width={40} height={40} unoptimized />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{row.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {row.rarity} · {SLOT_LABELS[row.slot]}
                    </p>
                    {!row.compatible && row.reason ? (
                      <p className="mt-0.5 text-[10px] text-[var(--amber)]">{row.reason}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="btn-primary focus-ring shrink-0 text-[11px] disabled:opacity-40"
                    disabled={busy || panel.inspectOnly || !row.compatible}
                    onClick={() => void equip(row.itemId)}
                  >
                    Equip
                  </button>
                </li>
              ))}
            </ul>
            {filtered.length === 0 ? (
              <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                No owned compatible items for this filter. Buy gear in the Shop — Equip Now
                grants ownership immediately.
              </p>
            ) : null}

            {status ? <p className="mt-3 text-xs text-[var(--mint)]">{status}</p> : null}
            {error ? <p className="mt-3 text-xs text-[var(--amber)]">{error}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
