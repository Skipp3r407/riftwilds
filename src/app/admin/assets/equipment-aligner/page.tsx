"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WEAPON_CATALOG } from "@/lib/items/catalog/weapons";

export default function EquipmentAlignerPage() {
  const [weaponId, setWeaponId] = useState(WEAPON_CATALOG[0]?.id ?? "");
  const [offsetX, setOffsetX] = useState(12);
  const [offsetY, setOffsetY] = useState(8);
  const [scale, setScale] = useState(0.45);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const weapon = WEAPON_CATALOG.find((w) => w.id === weaponId);

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-white">Equipment aligner</h1>
        <Link href="/admin/items" className="btn-secondary focus-ring text-sm">
          Items admin
        </Link>
      </div>
      <p className="text-sm text-[var(--text-muted)]">
        Drag-style offset editor (sliders for Phase 1). Saves are local until DB attachment rows
        are wired.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel relative flex h-80 items-center justify-center overflow-hidden p-4">
          <Image
            src="/assets/placeholders/creature-cindercub-battle.svg"
            alt="Pet"
            width={220}
            height={220}
            unoptimized
          />
          {weapon ? (
            <Image
              src={weapon.iconPath}
              alt=""
              width={96}
              height={96}
              unoptimized
              style={{
                position: "absolute",
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1})`,
              }}
            />
          ) : null}
        </div>
        <div className="panel space-y-3 p-4 text-sm">
          <label className="block">
            <span className="text-[var(--text-muted)]">Equipment</span>
            <select
              className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2 text-white"
              value={weaponId}
              onChange={(e) => setWeaponId(e.target.value)}
            >
              {WEAPON_CATALOG.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
          {(
            [
              ["offsetX", offsetX, setOffsetX, -40, 40],
              ["offsetY", offsetY, setOffsetY, -40, 40],
              ["scale", scale, setScale, 0.2, 1.2],
              ["rotation", rotation, setRotation, -45, 45],
            ] as const
          ).map(([key, val, set, min, max]) => (
            <label key={key} className="block">
              <span className="text-[var(--text-muted)]">
                {key}: {typeof val === "number" ? val.toFixed(2) : val}
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={key === "scale" ? 0.01 : 1}
                value={val}
                onChange={(e) => set(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
          ))}
          <label className="flex items-center gap-2 text-[var(--text-muted)]">
            <input type="checkbox" checked={flipX} onChange={(e) => setFlipX(e.target.checked)} />
            Mirror (flipX)
          </label>
          <p className="text-xs text-[var(--cyan)]">
            Attachment: {weapon?.attachment ?? "—"} · Depth / animation overrides TBD
          </p>
          <button
            type="button"
            className="btn-primary focus-ring w-full"
            onClick={() => {
              const payload = { weaponId, offsetX, offsetY, scale, rotation, flipX };
              localStorage.setItem(
                `equipment-align:${weaponId}`,
                JSON.stringify(payload),
              );
              alert("Saved locally. Mark approved in admin workflow when DB is wired.");
            }}
          >
            Save offsets (local)
          </button>
        </div>
      </div>
    </main>
  );
}
