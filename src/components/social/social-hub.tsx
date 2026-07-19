"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { StatusChip } from "@/components/shared/page-header";
import { AvatarPicker } from "@/components/social/avatar-picker";
import { ImageButton } from "@/components/ui/image-button";
import { RiftPanel } from "@/components/ui/rift-panel";
import { brandMarkPath } from "@/lib/assets/paths";
import type {
  DmMessageView,
  DmThreadView,
  FriendListEntry,
  FriendRequestView,
  MessagePrivacyMode,
  SocialHubSnapshot,
  SocialSummary,
} from "@/lib/social/types";
import { cn } from "@/lib/utils/cn";

type TabId = "friends" | "requests" | "messages" | "safety";

const TABS: { id: TabId; label: string }[] = [
  { id: "friends", label: "Friends" },
  { id: "requests", label: "Requests" },
  { id: "messages", label: "Messages" },
  { id: "safety", label: "Avatar & safety" },
];

function Avatar({ src, size = 40 }: { src: string; size?: number }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-[var(--stroke)] object-cover"
      unoptimized
    />
  );
}

function presenceTone(status: FriendListEntry["status"]): "info" | "warn" | "default" {
  if (status === "online") return "info";
  if (status === "away") return "warn";
  return "default";
}

export function SocialHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [hub, setHub] = useState<SocialHubSnapshot | null>(null);
  const [summary, setSummary] = useState<SocialSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addHandle, setAddHandle] = useState("");
  const [compose, setCompose] = useState("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<DmMessageView[]>([]);
  const [activeThread, setActiveThread] = useState<DmThreadView | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [handleDraft, setHandleDraft] = useState("");

  const tabParam = searchParams.get("tab") as TabId | null;
  const tab: TabId = TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : "friends";
  const whisperTarget = searchParams.get("with") ?? searchParams.get("whisper");
  const addTarget = searchParams.get("add");

  function setTab(next: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`/social?${params.toString()}`, { scroll: false });
  }

  function refreshHub() {
    startTransition(async () => {
      const res = await fetch("/api/social/friends?view=summary");
      const data = await res.json();
      if (data.hub) {
        setHub(data.hub as SocialHubSnapshot);
        setSummary(data.hub.summary as SocialSummary);
        setDisplayName(data.hub.me.displayName);
        setHandleDraft(data.hub.me.handle);
      }
    });
  }

  async function loadThread(threadId: string) {
    const res = await fetch(`/api/social/messages?threadId=${encodeURIComponent(threadId)}`);
    const data = await res.json();
    if (data.ok) {
      setActiveThreadId(threadId);
      setActiveThread(data.thread);
      setThreadMessages(data.messages ?? []);
      if (data.summary) setSummary(data.summary);
    }
  }

  useEffect(() => {
    refreshHub();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount + deep-link once
  }, []);

  useEffect(() => {
    if (addTarget) {
      setAddHandle(addTarget);
      setTab("friends");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addTarget]);

  useEffect(() => {
    if (!whisperTarget || !hub) return;
    setTab("messages");
    const existing = hub.threads.find(
      (t) =>
        t.peer.handle === whisperTarget.toLowerCase() ||
        t.peer.displayName.toLowerCase() === whisperTarget.toLowerCase(),
    );
    if (existing) {
      void loadThread(existing.id);
    } else {
      setActiveThreadId(null);
      setActiveThread({
        id: "",
        peer: {
          ownerKey: "",
          handle: whisperTarget.toLowerCase(),
          displayName: whisperTarget,
          avatarSrc: brandMarkPath,
        },
        preview: null,
        lastMessageAt: null,
        unreadCount: 0,
      });
      setThreadMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whisperTarget, hub?.me.handle]);

  async function postFriends(body: Record<string, unknown>) {
    setMessage(null);
    setError(null);
    const res = await fetch("/api/social/friends", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.message ?? data.error ?? "Request failed");
      return data;
    }
    if (data.hub) {
      setHub(data.hub);
      setSummary(data.hub.summary);
    } else {
      refreshHub();
    }
    setMessage(typeof data.message === "string" ? data.message : "Done.");
    return data;
  }

  async function postMessage(body: Record<string, unknown>) {
    setMessage(null);
    setError(null);
    const res = await fetch("/api/social/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.message ?? data.error ?? "Send failed");
      return data;
    }
    if (data.summary) setSummary(data.summary);
    if (data.threads && hub) {
      setHub({ ...hub, threads: data.threads, summary: data.summary ?? hub.summary });
    }
    if (data.threadId) {
      setActiveThreadId(data.threadId);
      setActiveThread(data.thread);
      setThreadMessages(data.messages ?? []);
    }
    setCompose("");
    setMessage("Message sent.");
    return data;
  }

  const requests = hub?.requests ?? [];
  const incoming = requests.filter((r) => r.direction === "incoming");
  const outgoing = requests.filter((r) => r.direction === "outgoing");

  return (
    <div className="space-y-5">
      {hub ? (
        <section className="panel-soft flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="focus-ring shrink-0 rounded-full"
              onClick={() => setTab("safety")}
              title="Change avatar"
              aria-label="Change avatar"
            >
              <Avatar src={hub.me.avatarSrc} size={48} />
            </button>
            <div className="min-w-0">
              <p className="truncate font-display text-lg text-white">{hub.me.displayName}</p>
              <p className="text-xs text-[var(--text-dim)]">
                @{hub.me.handle} · {hub.me.rankTitle}
              </p>
              <button
                type="button"
                className="mt-1 text-[11px] text-[var(--cyan)] underline focus-ring"
                onClick={() => setTab("safety")}
              >
                Change avatar
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <StatusChip tone="info">{summary?.friendsCount ?? 0} friends</StatusChip>
            <StatusChip tone="default">{summary?.onlineFriendsCount ?? 0} online</StatusChip>
            {(summary?.unreadMessages ?? 0) > 0 ? (
              <StatusChip tone="warn">{summary!.unreadMessages} unread</StatusChip>
            ) : null}
            {(summary?.pendingIncomingRequests ?? 0) > 0 ? (
              <StatusChip tone="warn">{summary!.pendingIncomingRequests} requests</StatusChip>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="panel p-5 text-sm text-[var(--text-muted)]">Loading social graph…</section>
      )}

      <nav className="flex flex-wrap gap-2" aria-label="Social sections">
        {TABS.map((t) => {
          const badge =
            t.id === "requests"
              ? summary?.pendingIncomingRequests
              : t.id === "messages"
                ? summary?.unreadMessages
                : 0;
          const active = tab === t.id;
          return (
            <ImageButton
              key={t.id}
              type="button"
              variant="tab"
              size="sm"
              selected={active}
              onClick={() => setTab(t.id)}
              className="relative shrink-0"
              aria-current={active ? "page" : undefined}
            >
              {t.label}
              {badge && badge > 0 ? (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--amber)] px-1 text-[10px] font-medium text-black">
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
            </ImageButton>
          );
        })}
      </nav>

      {(message || error) && (
        <p
          className={cn(
            "text-sm",
            error ? "text-[var(--danger)]" : "text-[var(--cyan)]",
          )}
          role="status"
        >
          {error ?? message}
        </p>
      )}

      {tab === "friends" ? (
        <section className="space-y-4">
          <article className="panel p-5">
            <h2 className="font-display text-xl text-white">Add a friend</h2>
            <p className="mt-1 text-xs text-[var(--text-dim)]">
              Search by handle — try <span className="text-white">keeper_mira</span>,{" "}
              <span className="text-white">captain_reed</span>, or{" "}
              <span className="text-white">archivist_echo</span>. No wallet needed.
            </p>
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (!addHandle.trim()) return;
                void postFriends({ action: "request", handle: addHandle.trim() }).then(() =>
                  setAddHandle(""),
                );
              }}
            >
              <input
                className="focus-ring flex-1 rounded border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-white"
                placeholder="Handle (e.g. keeper_mira)"
                value={addHandle}
                onChange={(e) => setAddHandle(e.target.value)}
                maxLength={40}
                aria-label="Friend handle"
              />
              <button type="submit" className="btn-primary focus-ring text-sm" disabled={pending}>
                Send request
              </button>
            </form>
          </article>

          <article className="panel p-5">
            <h2 className="font-display text-xl text-white">Friends</h2>
            {!hub?.friends.length ? (
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                No friends yet — add a town keeper above, or share your handle @{hub?.me.handle}.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {hub.friends.map((f) => (
                  <li
                    key={f.friendshipId}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--stroke)] py-2"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar src={f.avatarSrc} />
                      <span className="min-w-0">
                        <span className="block truncate text-white">{f.displayName}</span>
                        <span className="text-xs text-[var(--text-dim)]">
                          @{f.handle} · {f.rankTitle} · {f.activityStub}
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusChip tone={presenceTone(f.status)}>{f.status}</StatusChip>
                      <button
                        type="button"
                        className="btn-secondary focus-ring text-xs"
                        onClick={() => {
                          setTab("messages");
                          const existing = hub.threads.find((t) => t.peer.ownerKey === f.ownerKey);
                          if (existing) void loadThread(existing.id);
                          else {
                            setActiveThread({
                              id: "",
                              peer: {
                                ownerKey: f.ownerKey,
                                handle: f.handle,
                                displayName: f.displayName,
                                avatarSrc: f.avatarSrc,
                              },
                              preview: null,
                              lastMessageAt: null,
                              unreadCount: 0,
                            });
                            setActiveThreadId(null);
                            setThreadMessages([]);
                          }
                        }}
                      >
                        Message
                      </button>
                      <Link
                        href="/homestead"
                        className="btn-secondary focus-ring text-xs"
                        title="Visit home (housing)"
                      >
                        Visit home
                      </Link>
                      <button
                        type="button"
                        className="btn-secondary focus-ring text-xs"
                        disabled={pending}
                        onClick={() =>
                          void postFriends({ action: "party_invite", handle: f.handle })
                        }
                      >
                        Invite
                      </button>
                      <button
                        type="button"
                        className="focus-ring text-xs text-[var(--text-dim)] underline"
                        disabled={pending}
                        onClick={() =>
                          void postFriends({ action: "remove", peerOwnerKey: f.ownerKey })
                        }
                      >
                        Remove
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      ) : null}

      {tab === "requests" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="panel p-5">
            <h2 className="font-display text-xl text-white">Incoming</h2>
            {!incoming.length ? (
              <p className="mt-3 text-sm text-[var(--text-muted)]">No pending requests.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {incoming.map((r: FriendRequestView) => (
                  <li key={r.id} className="flex items-start justify-between gap-3">
                    <span className="flex gap-3">
                      <Avatar src={r.peer.avatarSrc} />
                      <span>
                        <span className="text-white">{r.peer.displayName}</span>
                        <span className="block text-xs text-[var(--text-dim)]">@{r.peer.handle}</span>
                        {r.note ? (
                          <span className="mt-1 block text-xs text-[var(--text-muted)]">{r.note}</span>
                        ) : null}
                      </span>
                    </span>
                    <span className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="btn-primary focus-ring text-xs"
                        disabled={pending}
                        onClick={() => void postFriends({ action: "accept", requestId: r.id })}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="btn-secondary focus-ring text-xs"
                        disabled={pending}
                        onClick={() => void postFriends({ action: "decline", requestId: r.id })}
                      >
                        Decline
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
          <article className="panel p-5">
            <h2 className="font-display text-xl text-white">Outgoing</h2>
            {!outgoing.length ? (
              <p className="mt-3 text-sm text-[var(--text-muted)]">No outgoing requests.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {outgoing.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-3">
                      <Avatar src={r.peer.avatarSrc} size={36} />
                      <span className="text-sm text-white">{r.peer.displayName}</span>
                    </span>
                    <button
                      type="button"
                      className="btn-secondary focus-ring text-xs"
                      disabled={pending}
                      onClick={() => void postFriends({ action: "cancel", requestId: r.id })}
                    >
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      ) : null}

      {tab === "messages" ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,14rem)_1fr]">
          <article className="panel p-3">
            <h2 className="px-2 font-display text-lg text-white">Inbox</h2>
            <ul className="mt-2 max-h-[22rem] space-y-1 overflow-auto">
              {(hub?.threads ?? []).map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={cn(
                      "focus-ring flex w-full items-start gap-2 rounded px-2 py-2 text-left text-sm",
                      activeThreadId === t.id
                        ? "bg-[rgba(61,231,255,0.1)]"
                        : "hover:bg-[rgba(255,255,255,0.04)]",
                    )}
                    onClick={() => void loadThread(t.id)}
                  >
                    <Avatar src={t.peer.avatarSrc} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-white">{t.peer.displayName}</span>
                        {t.unreadCount > 0 ? (
                          <span className="shrink-0 rounded-full bg-[var(--amber)] px-1.5 text-[10px] text-black">
                            {t.unreadCount}
                          </span>
                        ) : null}
                      </span>
                      <span className="block truncate text-xs text-[var(--text-dim)]">
                        {t.preview ?? "No messages yet"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {!hub?.threads.length && !activeThread ? (
                <li className="px-2 py-3 text-xs text-[var(--text-muted)]">
                  No threads yet — message a friend from the Friends tab.
                </li>
              ) : null}
            </ul>
          </article>

          <article className="panel flex min-h-[22rem] flex-col p-4">
            {activeThread ? (
              <>
                <div className="flex items-center gap-3 border-b border-[var(--stroke)] pb-3">
                  <Avatar src={activeThread.peer.avatarSrc} size={36} />
                  <div>
                    <p className="text-white">{activeThread.peer.displayName}</p>
                    <p className="text-xs text-[var(--text-dim)]">@{activeThread.peer.handle}</p>
                  </div>
                </div>
                <ul className="mt-3 flex-1 space-y-2 overflow-auto">
                  {threadMessages.map((m) => (
                    <li
                      key={m.id}
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                        m.mine
                          ? "ml-auto bg-[rgba(61,231,255,0.12)] text-white"
                          : "bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)]",
                      )}
                    >
                      {m.body}
                      <span className="mt-1 block text-[10px] text-[var(--text-dim)]">
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                  {!threadMessages.length ? (
                    <li className="text-sm text-[var(--text-muted)]">
                      Say hello — friends-only by default.
                    </li>
                  ) : null}
                </ul>
                <form
                  className="mt-3 flex gap-2 border-t border-[var(--stroke)] pt-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!compose.trim()) return;
                    void postMessage({
                      action: "send",
                      handle: activeThread.peer.handle,
                      body: compose.trim(),
                    });
                  }}
                >
                  <input
                    className="focus-ring flex-1 rounded border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-white"
                    placeholder="Whisper…"
                    value={compose}
                    onChange={(e) => setCompose(e.target.value)}
                    maxLength={500}
                    aria-label="Private message"
                  />
                  <button type="submit" className="btn-primary focus-ring text-sm" disabled={pending}>
                    Send
                  </button>
                </form>
              </>
            ) : (
              <p className="m-auto text-sm text-[var(--text-muted)]">
                Select a conversation or message a friend.
              </p>
            )}
          </article>
        </section>
      ) : null}

      {tab === "safety" ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
          <div className="space-y-4">
            <RiftPanel material="obsidian" filigree padding="md">
              <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--cyan)]">
                Settings
              </p>
              <h2 className="font-display mt-1 text-xl text-white md:text-2xl">Your identity</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-dim)]">
                Pick a Riftling avatar below, then set how keepers find you. Wallet optional —
                Credits ≠ SOL.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-[var(--text-muted)] sm:col-span-2">
                  Display name
                  <input
                    className="focus-ring mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-white"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={32}
                  />
                </label>
                <button
                  type="button"
                  className="btn-secondary focus-ring text-sm sm:col-span-2 sm:w-fit"
                  disabled={pending}
                  onClick={() =>
                    void postFriends({ action: "set_display_name", displayName })
                  }
                >
                  Save name
                </button>
                <label className="block text-xs text-[var(--text-muted)]">
                  Handle
                  <input
                    className="focus-ring mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-white"
                    value={handleDraft}
                    onChange={(e) => setHandleDraft(e.target.value)}
                    maxLength={24}
                  />
                </label>
                <label className="block text-xs text-[var(--text-muted)]">
                  Who can message you
                  <select
                    className="focus-ring mt-1 w-full rounded-lg border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-white"
                    value={hub?.messagePrivacy ?? "friends_only"}
                    onChange={(e) =>
                      void postFriends({
                        action: "set_privacy",
                        messagePrivacy: e.target.value as MessagePrivacyMode,
                      })
                    }
                  >
                    <option value="friends_only">Friends only</option>
                    <option value="anyone">Anyone (not blocked)</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="btn-secondary focus-ring text-sm sm:w-fit"
                  disabled={pending}
                  onClick={() => void postFriends({ action: "set_handle", handle: handleDraft })}
                >
                  Save handle
                </button>
              </div>
            </RiftPanel>

            <AvatarPicker
              onSelected={(src, key) => {
                if (!hub) return;
                setHub({
                  ...hub,
                  me: { ...hub.me, avatarSrc: src, avatarKey: key },
                });
              }}
            />
          </div>

          <RiftPanel material="marble" filigree padding="md" className="h-fit">
            <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--cyan)]">
              Safety
            </p>
            <h2 className="font-display mt-1 text-xl text-white">Block list</h2>
            {!hub?.blocks.length ? (
              <p className="mt-3 text-sm text-[var(--text-muted)]">No blocked keepers.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {hub.blocks.map((b) => (
                  <li key={b.ownerKey} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-white">
                      <Avatar src={b.avatarSrc} size={32} />
                      {b.displayName}
                    </span>
                    <button
                      type="button"
                      className="btn-secondary focus-ring text-xs"
                      disabled={pending}
                      onClick={() =>
                        void postFriends({ action: "unblock", peerOwnerKey: b.ownerKey })
                      }
                    >
                      Unblock
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="mt-6 font-display text-lg text-white">Report a keeper</h3>
            <p className="mt-1 text-xs text-[var(--text-dim)]">
              Logs a moderation stub for review. For site bugs use{" "}
              <Link href="/feedback" className="text-[var(--cyan)] focus-ring">
                Feedback
              </Link>
              .
            </p>
            <form
              className="mt-3 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const handle = String(fd.get("handle") ?? "").trim();
                const reason = String(fd.get("reason") ?? "").trim();
                if (!handle || !reason) return;
                void postFriends({ action: "report", handle, reason }).then(() => {
                  e.currentTarget.reset();
                });
              }}
            >
              <input
                name="handle"
                className="focus-ring w-full rounded border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-white"
                placeholder="Handle"
                required
              />
              <input
                name="reason"
                className="focus-ring w-full rounded border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-white"
                placeholder="Reason"
                required
                maxLength={120}
              />
              <button type="submit" className="btn-secondary focus-ring text-sm" disabled={pending}>
                Submit report
              </button>
            </form>

            <div className="mt-6 space-y-2 text-xs text-[var(--text-dim)]">
              <p>
                Quick block from friends: open Friends → use Remove, then report here if needed.
              </p>
              <p>
                Block from a friend row:{" "}
                <button
                  type="button"
                  className="text-[var(--cyan)] underline focus-ring"
                  onClick={() => {
                    const handle = window.prompt("Handle to block?");
                    if (handle) void postFriends({ action: "block", handle, reason: "manual" });
                  }}
                >
                  Block by handle
                </button>
              </p>
            </div>
          </RiftPanel>
        </section>
      ) : null}

      <p className="text-xs text-[var(--text-dim)]">
        {hub?.note ??
          "Friends and PMs are server-validated. Real-time WebSocket delivery is backlog."}
      </p>
    </div>
  );
}
