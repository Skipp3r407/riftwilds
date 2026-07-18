"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import type { PlayerPose, WorldMapFilter, WorldMapUiState } from "@/game/live-world/types";
import { REGION_IDENTITIES, REGION_BY_SLUG } from "@/game/world-maps/regions";
import { getBlueprint } from "@/game/world-maps/blueprints";
import {
  fogCoverageRatio,
  getVisitedCells,
  FOG_CELL_SIZE,
} from "@/game/live-world/systems/exploration-fog";
import {
  findPath,
  formatGuidance,
  pathAlongPathways,
} from "@/game/live-world/systems/pathfinding";
import { getInputManager } from "@/game/live-world/input/input-manager";
import {
  CONTINENT_SPINE,
  getRegionUnlockView,
  getWorldCompletionSnapshot,
  listVisibleGateways,
  previewFastTravel,
} from "@/game/world-travel";
import { GATEWAY_STONE_ART, TRAVEL_LOADING_ART } from "@/game/world-travel/transitions";
import {
  addCustomWaypoint,
  getExplorationLog,
  getRegionCompletion,
  markerFallbackColor,
  queryMapMarkers,
  removeCustomWaypoint,
  resolveMapIconPath,
  setLegendToggles,
  loadExplorationProgress,
  type LegendToggleState,
  type MapLegendCategory,
  type MapMarker,
} from "@/game/world-exploration";

type Props = {
  bridge: LiveWorldBridge;
};

const FILTERS: WorldMapFilter[] = [
  "all",
  "quests",
  "services",
  "portals",
  "waypoints",
  "gateways",
  "treasures",
  "enemies",
  "bosses",
  "pois",
  "habitats",
  "events",
  "custom",
];

const LEGEND_LABELS: Record<MapLegendCategory, string> = {
  quests: "Quests",
  services: "Services",
  portals: "Portals",
  waypoints: "Waypoints",
  gateways: "Gateways",
  treasures: "Treasures",
  enemies: "Enemies",
  bosses: "Bosses",
  pois: "POIs",
  habitats: "Habitats",
  events: "Events",
  custom: "Custom",
  perks: "Perks",
};

function filterToLegend(filter: WorldMapFilter): Partial<LegendToggleState> | undefined {
  if (filter === "all") return undefined;
  const allOff = Object.fromEntries(
    Object.keys(LEGEND_LABELS).map((k) => [k, false]),
  ) as LegendToggleState;
  return { ...allOff, [filter]: true };
}

export function LiveWorldMapOverlay({ bridge }: Props) {
  const [mapUi, setMapUi] = useState(bridge.mapUi.get());
  const [pose, setPose] = useState<PlayerPose>(bridge.playerPose.get());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null,
  );
  const [guidance, setGuidance] = useState("");
  const [tick, setTick] = useState(0);
  const [legendOpen, setLegendOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [pinLabel, setPinLabel] = useState("Custom pin");

  useEffect(() => {
    const u1 = bridge.mapUi.subscribe(setMapUi);
    const u2 = bridge.playerPose.subscribe(setPose);
    const u3 = getInputManager().subscribe(() => {
      if (getInputManager().getActivePanel() !== "map" && bridge.mapUi.get().open) {
        // keep in sync if Escape closed panel
      }
    });
    const id = window.setInterval(() => setTick((t) => t + 1), 800);
    return () => {
      u1();
      u2();
      u3();
      window.clearInterval(id);
    };
  }, [bridge]);

  useEffect(() => {
    if (!mapUi.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        bridge.closeWorldMap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mapUi.open, bridge]);

  const regionSlug = mapUi.regionSlug ?? pose.regionSlug;
  const bp = useMemo(() => {
    try {
      return getBlueprint(regionSlug);
    } catch {
      return null;
    }
  }, [regionSlug]);

  const gateways = useMemo(() => listVisibleGateways(), [tick, mapUi.open]);
  const completion = useMemo(() => getWorldCompletionSnapshot(), [tick, mapUi.open]);
  const regionCompletion = useMemo(
    () => getRegionCompletion(regionSlug),
    [regionSlug, tick, mapUi.open],
  );
  const travelPreview = useMemo(() => {
    if (!mapUi.travelPreviewTo) return null;
    return previewFastTravel(pose.regionSlug, mapUi.travelPreviewTo);
  }, [mapUi.travelPreviewTo, pose.regionSlug, tick]);

  const legend = loadExplorationProgress().legendToggles;
  void tick;

  const markerResult = useMemo(() => {
    return queryMapMarkers({
      regionSlug,
      search: mapUi.search,
      legend: filterToLegend(mapUi.filter),
      includeHints: true,
      limit: 180,
      clusterThreshold: 56,
    });
  }, [regionSlug, mapUi.search, mapUi.filter, tick]);

  const explorationLog = useMemo(() => getExplorationLog(24), [tick, mapUi.open]);

  const selectedMarker: MapMarker | null = useMemo(() => {
    if (!mapUi.selectedMarkerId) return null;
    return (
      markerResult.markers.find((m) => m.id === mapUi.selectedMarkerId) ??
      markerResult.hints.find((m) => m.id === mapUi.selectedMarkerId) ??
      null
    );
  }, [mapUi.selectedMarkerId, markerResult]);

  const patchMap = (partial: Partial<WorldMapUiState>) => {
    bridge.mapUi.set({ ...bridge.mapUi.get(), ...partial });
  };

  if (!mapUi.open) return null;

  const isWorld = mapUi.mode === "world";

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
      <div className="flex h-full max-h-[92%] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[#0c1420]">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              {isWorld ? "World Map" : "Regional Map"} · M to toggle · Esc close
            </p>
            <h2 className="font-display text-lg text-white">
              {isWorld
                ? "Riftwilds Continents"
                : (REGION_BY_SLUG[regionSlug]?.name ?? "Region")}
            </h2>
            <p className="mt-0.5 text-[10px] text-[var(--cyan)]">
              World {completion.percentComplete}% · Gateways {completion.gatewaysActivated}/
              {completion.gatewaysTotal} · Explored {completion.regionsDiscovered}/
              {completion.regionsTotal}
              {!isWorld && (
                <>
                  {" "}
                  · Region {regionCompletion.percentComplete}% fog{" "}
                  {regionCompletion.fogPercent}%
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn-secondary focus-ring text-xs"
              onClick={() =>
                patchMap({
                  mode: isWorld ? "region" : "world",
                  regionSlug,
                })
              }
            >
              {isWorld ? "Zoom region" : "World view"}
            </button>
            {!isWorld && (
              <>
                <input
                  type="search"
                  value={mapUi.search}
                  placeholder="Search markers…"
                  className="focus-ring w-36 rounded border border-[var(--border)] bg-black/40 px-2 py-1 text-[11px] text-white placeholder:text-[var(--text-dim)]"
                  onChange={(e) => patchMap({ search: e.target.value })}
                />
                <button
                  type="button"
                  className="btn-secondary focus-ring text-xs"
                  onClick={() => setLegendOpen((v) => !v)}
                >
                  Legend
                </button>
                <button
                  type="button"
                  className="btn-secondary focus-ring text-xs"
                  onClick={() => setLogOpen((v) => !v)}
                >
                  Log
                </button>
                <button
                  type="button"
                  className={`focus-ring rounded px-2 py-1 text-[10px] ${
                    mapUi.placingCustomPin
                      ? "bg-[var(--cyan)]/25 text-[var(--cyan)]"
                      : "text-[var(--text-muted)]"
                  }`}
                  onClick={() =>
                    patchMap({ placingCustomPin: !mapUi.placingCustomPin })
                  }
                >
                  Drop pin
                </button>
              </>
            )}
            {!isWorld &&
              FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`focus-ring rounded px-2 py-1 text-[10px] capitalize ${
                    mapUi.filter === f
                      ? "bg-[var(--cyan)]/25 text-[var(--cyan)]"
                      : "text-[var(--text-muted)]"
                  }`}
                  onClick={() => patchMap({ filter: f })}
                >
                  {f}
                </button>
              ))}
            <button
              type="button"
              className="btn-secondary focus-ring text-xs"
              onClick={() => bridge.closeWorldMap()}
            >
              Close
            </button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {isWorld ? (
            <div className="grid h-full grid-cols-1 gap-0 md:grid-cols-[1fr_240px]">
              <div className="grid grid-cols-2 gap-2 overflow-auto p-4 md:grid-cols-3 lg:grid-cols-4">
                {REGION_IDENTITIES.map((r) => {
                  const unlock = getRegionUnlockView(r.slug);
                  const gw = gateways.find((g) => g.regionId === r.id);
                  const cover = (() => {
                    try {
                      const b = getBlueprint(r.slug);
                      return fogCoverageRatio(r.slug, b.camera.width, b.camera.height);
                    } catch {
                      return 0;
                    }
                  })();
                  const rc = getRegionCompletion(r.slug);
                  const onSpine = CONTINENT_SPINE.includes(r.id);
                  return (
                    <button
                      key={r.slug}
                      type="button"
                      className={`panel focus-ring p-3 text-left transition hover:border-[var(--cyan)]/40 ${
                        !unlock.unlocked ? "opacity-80" : ""
                      }`}
                      onClick={() => {
                        if (!unlock.unlocked) {
                          patchMap({
                            mode: "world",
                            regionSlug: r.slug,
                            travelPreviewTo: null,
                            selectedGatewayId: gw?.id ?? null,
                          });
                          setGuidance(
                            unlock.requirements
                              .filter((x) => !x.met)
                              .map((x) => x.label)
                              .join(" · ") || unlock.note,
                          );
                          return;
                        }
                        if (gw?.activated && r.slug !== pose.regionSlug) {
                          patchMap({
                            travelPreviewTo: r.slug,
                            selectedGatewayId: gw.id,
                            regionSlug: r.slug,
                          });
                          setGuidance(`Gateway ready · ${r.name}`);
                          return;
                        }
                        patchMap({
                          mode: "region",
                          regionSlug: r.slug,
                        });
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display text-sm text-white">{r.name}</p>
                        {gw?.activated ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={GATEWAY_STONE_ART}
                            alt=""
                            className="h-6 w-6 opacity-90"
                          />
                        ) : (
                          <span className="text-[9px] text-[var(--text-dim)]">
                            {unlock.unlocked ? "undiscovered" : "sealed"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-[var(--text-dim)]">
                        {unlock.unlocked ? r.blurb : unlock.teaser}
                      </p>
                      {!unlock.unlocked && (
                        <ul className="mt-2 space-y-0.5 text-[9px] text-amber-200/80">
                          {unlock.requirements.map((req) => (
                            <li key={req.key}>
                              {req.met ? "✓" : "○"} {req.label}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-2 text-[10px] text-[var(--cyan)]">
                        {onSpine ? "spine · " : ""}
                        {r.playability.replace("_", " ")} · fog {Math.round(cover * 100)}% ·
                        explore {rc.percentComplete}%
                      </p>
                    </button>
                  );
                })}
              </div>
              <aside className="border-t border-[var(--border)] p-3 md:border-l md:border-t-0">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                  Fast travel
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  Walking discovers Gateways. Fast travel uses Credits (free on early hubs) —
                  never SOL. Only unlocked discovered locations.
                </p>
                {travelPreview ? (
                  <div className="mt-3 space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={TRAVEL_LOADING_ART}
                      alt=""
                      className="h-24 w-full rounded object-cover opacity-90"
                    />
                    <p className="font-display text-sm text-white">{travelPreview.toName}</p>
                    <p className="text-[10px] text-[var(--text-dim)]">{travelPreview.teaser}</p>
                    <p className="text-[11px] text-[var(--cyan)]">
                      {travelPreview.free
                        ? "Free early travel"
                        : `${travelPreview.feeCredits} Credits`}
                    </p>
                    {travelPreview.blocked ? (
                      <p className="text-[11px] text-amber-200">{travelPreview.blockMessage}</p>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary focus-ring w-full text-xs"
                        onClick={() => {
                          bridge.requestTravel(travelPreview.toRegionId, "fast_travel");
                        }}
                      >
                        Travel via Gateway
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-[11px] text-[var(--text-dim)]">
                    Select an activated Gateway region to preview travel.
                  </p>
                )}
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                    Activated stones
                  </p>
                  <ul className="mt-1 max-h-40 space-y-1 overflow-auto text-[11px]">
                    {gateways
                      .filter((g) => g.activated)
                      .map((g) => (
                        <li key={g.id}>
                          <button
                            type="button"
                            className="text-left text-[var(--cyan)] hover:underline"
                            onClick={() =>
                              patchMap({
                                travelPreviewTo: g.regionId,
                                selectedGatewayId: g.id,
                              })
                            }
                          >
                            {g.regionName}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              </aside>
            </div>
          ) : bp ? (
            <div className="grid h-full grid-cols-1 md:grid-cols-[1fr_220px]">
              <div
                className="relative h-full w-full cursor-grab overflow-hidden active:cursor-grabbing"
                onWheel={(e) => {
                  e.preventDefault();
                  setZoom((z) => Math.min(3, Math.max(0.5, z - e.deltaY * 0.001)));
                }}
                onPointerDown={(e) => {
                  drag.current = {
                    x: e.clientX,
                    y: e.clientY,
                    panX: pan.x,
                    panY: pan.y,
                  };
                  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (!drag.current) return;
                  setPan({
                    x: drag.current.panX + (e.clientX - drag.current.x),
                    y: drag.current.panY + (e.clientY - drag.current.y),
                  });
                }}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onClick={(e) => {
                  if (!mapUi.placingCustomPin || !bp) return;
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const localX = (e.clientX - rect.left - pan.x) / zoom;
                  const localY = (e.clientY - rect.top - pan.y) / zoom;
                  // Map canvas is centered; approximate against 640×480 surface
                  const mapLeft = (rect.width / zoom - 640) / 2;
                  const mapTop = (rect.height / zoom - 480) / 2;
                  const mx = ((localX - mapLeft) / 640) * bp.camera.width;
                  const my = ((localY - mapTop) / 480) * bp.camera.height;
                  if (mx < 0 || my < 0 || mx > bp.camera.width || my > bp.camera.height) {
                    return;
                  }
                  addCustomWaypoint({
                    regionSlug,
                    x: mx,
                    y: my,
                    label: pinLabel || "Custom pin",
                  });
                  patchMap({ placingCustomPin: false });
                  setGuidance(`Pinned “${pinLabel || "Custom pin"}”`);
                  setTick((t) => t + 1);
                }}
              >
                <div
                  className="relative mx-auto origin-center"
                  style={{
                    width: 640,
                    height: 480,
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    background:
                      "radial-gradient(ellipse at 40% 30%, rgba(36,48,72,0.95), #0a101c)",
                  }}
                >
                  {Array.from(getVisitedCells(regionSlug)).map((key) => {
                    const [cx, cy] = key.split(",").map(Number);
                    return (
                      <div
                        key={key}
                        className="absolute bg-[rgba(61,231,255,0.06)]"
                        style={{
                          left: ((cx! * FOG_CELL_SIZE) / bp.camera.width) * 640,
                          top: ((cy! * FOG_CELL_SIZE) / bp.camera.height) * 480,
                          width: (FOG_CELL_SIZE / bp.camera.width) * 640,
                          height: (FOG_CELL_SIZE / bp.camera.height) * 480,
                        }}
                      />
                    );
                  })}

                  {markerResult.clusters.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      title={c.label}
                      className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-[#3de7ff]/35 text-[9px] text-white"
                      style={{
                        left: (c.x / bp.camera.width) * 640,
                        top: (c.y / bp.camera.height) * 480,
                      }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setZoom((z) => Math.min(3, z + 0.35));
                        setGuidance(c.label);
                      }}
                    >
                      {c.count}
                    </button>
                  ))}

                  {markerResult.markers.map((m) => {
                    if (m.x == null || m.y == null) return null;
                    const left = (m.x / bp.camera.width) * 640;
                    const top = (m.y / bp.camera.height) * 480;
                    const icon = resolveMapIconPath(m.iconKey);
                    const selected = mapUi.selectedMarkerId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        title={`${m.label}${m.subtitle ? ` — ${m.subtitle}` : ""}`}
                        className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 ${
                          selected ? "ring-2 ring-[var(--cyan)]" : ""
                        }`}
                        style={{ left, top }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          patchMap({ selectedMarkerId: m.id, activeWaypointId: m.sourceObjectId ?? m.id });
                          if (m.kind === "gateway") {
                            patchMap({
                              mode: "world",
                              selectedGatewayId: m.sourceObjectId ?? m.id,
                              travelPreviewTo:
                                regionSlug === pose.regionSlug ? null : regionSlug,
                            });
                            setGuidance("Gateway Stone — use World view to fast travel");
                            return;
                          }
                          if (m.kind === "custom") {
                            setGuidance(m.label);
                            return;
                          }
                          if (
                            m.kind === "waypoint" ||
                            m.kind === "service" ||
                            m.kind === "quest" ||
                            m.kind === "poi"
                          ) {
                            const along = pathAlongPathways(
                              { x: pose.x, y: pose.y },
                              { x: m.x!, y: m.y! },
                              bp.pathways,
                            );
                            if (along) {
                              setGuidance(
                                `Pathway route · ${Math.round(
                                  Math.hypot(m.x! - pose.x, m.y! - pose.y),
                                )}u`,
                              );
                              return;
                            }
                            const result = findPath(
                              { x: pose.x, y: pose.y },
                              { x: m.x!, y: m.y! },
                              bp.colliders,
                              {
                                width: bp.camera.width,
                                height: bp.camera.height,
                              },
                            );
                            setGuidance(formatGuidance(result));
                          } else {
                            setGuidance(m.subtitle ?? m.label);
                          }
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={icon}
                          alt=""
                          className="h-full w-full object-contain drop-shadow"
                          onError={(e) => {
                            const el = e.target as HTMLImageElement;
                            el.style.display = "none";
                            el.parentElement!.style.background = markerFallbackColor(m.kind);
                            el.parentElement!.style.borderRadius = "9999px";
                            el.parentElement!.style.border = "1px solid rgba(255,255,255,0.3)";
                          }}
                        />
                      </button>
                    );
                  })}

                  {/* Region-level hints listed in sidebar only — no coordinate spoilers */}

                  <div
                    className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3de7ff] shadow-[0_0_8px_#3de7ff]"
                    style={{
                      left: (pose.x / bp.camera.width) * 640,
                      top: (pose.y / bp.camera.height) * 480,
                    }}
                  />
                </div>

                {legendOpen && (
                  <div className="absolute left-2 top-2 max-h-[70%] w-44 overflow-auto rounded border border-[var(--border)] bg-[#0a101c]/95 p-2 text-[10px]">
                    <p className="mb-1 uppercase tracking-wider text-[var(--text-dim)]">
                      Legend toggles
                    </p>
                    {(Object.keys(LEGEND_LABELS) as MapLegendCategory[]).map((key) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-2 py-0.5 text-[var(--text-muted)]"
                      >
                        <input
                          type="checkbox"
                          checked={legend[key] !== false}
                          onChange={() => {
                            setLegendToggles({ [key]: legend[key] === false });
                            setTick((t) => t + 1);
                          }}
                        />
                        {LEGEND_LABELS[key]}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <aside className="overflow-auto border-t border-[var(--border)] p-3 md:border-l md:border-t-0">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                  Region completion
                </p>
                <p className="mt-1 font-display text-sm text-white">
                  {regionCompletion.percentComplete}%
                </p>
                <ul className="mt-2 space-y-0.5 text-[10px] text-[var(--text-muted)]">
                  <li>
                    Fog {regionCompletion.fogPercent}%
                  </li>
                  <li>
                    Treasures {regionCompletion.treasuresFound}/
                    {regionCompletion.treasuresTotal}
                  </li>
                  <li>
                    POIs {regionCompletion.poisFound}/{regionCompletion.poisTotal}
                  </li>
                  <li>
                    Habitats {regionCompletion.habitatsFound}/
                    {regionCompletion.habitatsTotal}
                  </li>
                  <li>
                    Bosses {regionCompletion.bossesDefeated}/
                    {regionCompletion.bossesTotal}
                  </li>
                  <li>
                    Quests {regionCompletion.questsComplete}/
                    {regionCompletion.questsTotal}
                  </li>
                </ul>

                {mapUi.placingCustomPin && (
                  <div className="mt-3">
                    <p className="text-[10px] text-[var(--cyan)]">Click map to place pin</p>
                    <input
                      value={pinLabel}
                      onChange={(e) => setPinLabel(e.target.value)}
                      className="focus-ring mt-1 w-full rounded border border-[var(--border)] bg-black/40 px-2 py-1 text-[11px] text-white"
                    />
                  </div>
                )}

                {selectedMarker && (
                  <div className="mt-3 rounded border border-[var(--border)] p-2">
                    <p className="font-display text-xs text-white">{selectedMarker.label}</p>
                    {selectedMarker.subtitle && (
                      <p className="mt-1 text-[10px] text-[var(--text-dim)]">
                        {selectedMarker.subtitle}
                      </p>
                    )}
                    {selectedMarker.codexHref && (
                      <a
                        href={selectedMarker.codexHref}
                        className="mt-2 inline-block text-[11px] text-[var(--cyan)] hover:underline"
                      >
                        Open Codex / World
                      </a>
                    )}
                    {selectedMarker.kind === "custom" &&
                      typeof selectedMarker.metadata?.customId === "string" && (
                        <button
                          type="button"
                          className="mt-2 block text-[10px] text-amber-200 hover:underline"
                          onClick={() => {
                            removeCustomWaypoint(String(selectedMarker.metadata!.customId));
                            patchMap({ selectedMarkerId: null });
                            setTick((t) => t + 1);
                          }}
                        >
                          Remove pin
                        </button>
                      )}
                  </div>
                )}

                {markerResult.hints.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                      Leads (no spoilers)
                    </p>
                    <ul className="mt-1 max-h-28 space-y-1 overflow-auto text-[10px] text-[var(--text-muted)]">
                      {markerResult.hints.slice(0, 8).map((h) => (
                        <li key={h.id}>
                          <button
                            type="button"
                            className="text-left hover:text-[var(--cyan)]"
                            onClick={() => {
                              patchMap({ selectedMarkerId: h.id });
                              setGuidance(h.subtitle ?? h.label);
                            }}
                          >
                            {h.subtitle ?? h.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {logOpen && (
                  <div className="mt-3">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                      Exploration log
                    </p>
                    <ul className="mt-1 max-h-36 space-y-1 overflow-auto text-[10px] text-[var(--text-muted)]">
                      {explorationLog.length === 0 && <li>No discoveries yet.</li>}
                      {explorationLog.map((e) => (
                        <li key={e.id}>
                          <span className="text-[var(--text-dim)]">
                            {new Date(e.at).toLocaleTimeString()}
                          </span>{" "}
                          {e.summary}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
            </div>
          ) : (
            <p className="p-6 text-sm text-[var(--text-muted)]">Map data unavailable.</p>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] px-4 py-2 text-[11px] text-[var(--text-dim)]">
          <span>
            Zoom {zoom.toFixed(1)}x · {markerResult.markers.length} pins
            {markerResult.truncated ? " (capped)" : ""} · hidden secrets stay hidden
          </span>
          <span className="text-[var(--cyan)]">{guidance || "No active route"}</span>
        </footer>
      </div>
    </div>
  );
}
